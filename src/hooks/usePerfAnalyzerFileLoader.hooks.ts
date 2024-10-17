// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent AI ULC

import { getFolderPathSelector } from '../data/store/selectors/uiState.selectors';
import {
    closeDetailedView,
    setApplicationMode,
    setIsLoadingFolder,
    setSelectedFolder,
    setSelectedFolderLocationType,
} from '../data/store/slices/uiState.slice';
import { useDispatch, useSelector } from 'react-redux';
import {
    getAvailableGraphRelationships,
    loadCluster,
    loadGraph,
    validatePerfResultsFolder,
} from '../utils/FileLoaders';

import { ApplicationMode } from '../data/Types';
import { useContext, useEffect, useState } from 'react';
import { type Location, useLocation, useNavigate } from 'react-router-dom';
import { sortPerfAnalyzerGraphRelationships } from '../utils/FilenameSorters';
import { ClusterContext, ClusterModel } from '../data/ClusterContext';
import type GraphOnChip from '../data/GraphOnChip';
import type { NodeInitialState } from '../data/GraphOnChip';
import { GraphOnChipContext } from '../data/GraphOnChipContext';
import type {
    FolderLocationType,
    GraphRelationship,
    LocationState,
    NavigateOptions,
    NetworkCongestionState,
    PipeSelection,
} from '../data/StateTypes';
import { initialLoadLinkData, resetNetworksState } from '../data/store/slices/linkSaturation.slice';
import { initialLoadAllNodesData } from '../data/store/slices/nodeSelection.slice';
import { updateRandomRedux } from '../data/store/slices/operationPerf.slice';
import { loadPipeSelection, resetPipeSelection } from '../data/store/slices/pipeSelection.slice';
import { mapIterable } from '../utils/IterableHelpers';
import useLogging from './useLogging.hook';
import { showFileDialog } from '../utils/bridge.js';

const usePerfAnalyzerFileLoader = () => {
    const dispatch = useDispatch();
    const selectedFolder = useSelector(getFolderPathSelector);
    const [error, setError] = useState<string | null>(null);
    const logging = useLogging();
    const { setCluster } = useContext<ClusterModel>(ClusterContext);
    const { loadGraphOnChips, resetGraphOnChipState } = useContext(GraphOnChipContext);
    const navigate = useNavigate();
    const location: Location<LocationState> = useLocation();
    const logger = useLogging();

    useEffect(() => {
        dispatch(updateRandomRedux(Math.random()));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.state]);

    const openPerfAnalyzerFolderDialog = async () => {
        const folderList = await showFileDialog({
            properties: ['openDirectory'],
        });

        const folderPath = folderList?.[0] ?? undefined;
        if (!folderPath) {
            return undefined;
        }

        const [isValid, err] = validatePerfResultsFolder(folderPath);
        if (!isValid) {
            // eslint-disable-next-line no-alert
            alert(`Invalid folder selected: ${err}`);
            return undefined;
        }

        return folderPath;
    };

    const loadFolder = async (folderPath: string) => {
        resetGraphOnChipState();
        dispatch(resetPipeSelection());
        dispatch(resetNetworksState());
        setError(null);
        dispatch(setIsLoadingFolder(true));

        let graphs: GraphRelationship[] = [];

        try {
            // TODO: needs gone once we are happy with performance
            const entireRunStartTime = performance.now();
            graphs = await getAvailableGraphRelationships(folderPath);

            if (!graphs.length) {
                throw new Error(`No graphs found in\n${folderPath}`);
            }

            dispatch(setSelectedFolder(folderPath));
            const sortedGraphs = sortPerfAnalyzerGraphRelationships(graphs);
            const graphOnChipList: GraphOnChip[] = [];
            const linkDataByTemporalEpoch: NetworkCongestionState['linksPerTemporalEpoch'] = [];
            const pipeSelectionData: PipeSelection[] = [];
            const nodesDataPerTemporalEpoch: Record<number, NodeInitialState[]> = {};
            const times = [];

            for await (const graph of sortedGraphs) {
                const start = performance.now();

                const graphOnChip = await loadGraph(folderPath, graph);

                if (!linkDataByTemporalEpoch[graph.temporalEpoch]) {
                    linkDataByTemporalEpoch[graph.temporalEpoch] = {
                        totalOps: 0,
                        normalizedTotalOps: 0,
                        initialNormalizedTotalOps: 0,
                        totalOpsByChipId: [],
                    };
                }

                linkDataByTemporalEpoch[graph.temporalEpoch]!.totalOpsByChipId[graph.chipId] =
                    graphOnChip.totalOpCycles;

                const { totalOps: totalOpsPerEpoch } = linkDataByTemporalEpoch[graph.temporalEpoch]!;

                const ops = totalOpsPerEpoch ?? 1;
                const totalOps = Math.max(graphOnChip.totalOpCycles, ops);
                linkDataByTemporalEpoch[graph.temporalEpoch]!.initialNormalizedTotalOps = totalOps;
                linkDataByTemporalEpoch[graph.temporalEpoch]!.normalizedTotalOps = totalOps;
                linkDataByTemporalEpoch[graph.temporalEpoch]!.totalOps = totalOps;

                graphOnChipList.push(graphOnChip);
                pipeSelectionData.push(...graphOnChip.generateInitialPipesSelectionState());

                if (!nodesDataPerTemporalEpoch[graph.temporalEpoch]) {
                    nodesDataPerTemporalEpoch[graph.temporalEpoch] = [];
                }

                nodesDataPerTemporalEpoch[graph.temporalEpoch]!.push(
                    ...mapIterable(graphOnChip.nodes, (node) => node.generateInitialState()),
                );

                times.push({
                    graph: `${graph.name}`,
                    time: `${performance.now() - start} ms`,
                });
            }

            loadGraphOnChips(graphOnChipList, sortedGraphs);

            dispatch(initialLoadLinkData(linkDataByTemporalEpoch));

            dispatch(loadPipeSelection(pipeSelectionData));
            dispatch(initialLoadAllNodesData(nodesDataPerTemporalEpoch));

            // console.table(times, ['graph', 'time']);
            // console.log('total', performance.now() - entireRunStartTime, 'ms');
            logger.info(
                `Loaded ${folderPath} with ${graphs.length} graphs in ${performance.now() - entireRunStartTime} ms`,
            );
        } catch (e) {
            const err = e as Error;
            logging.error(`Failed to read graph names from folder: ${err.message}`);
            setError(err.message ?? 'Unknown Error');
        }

        setCluster(await loadCluster(folderPath));
        dispatch(setIsLoadingFolder(false));

        return graphs;
    };

    const loadPerfAnalyzerGraph = ({ chipId, temporalEpoch }: Omit<GraphRelationship, 'name'>) => {
        if (selectedFolder) {
            dispatch(closeDetailedView());

            navigate('/render', {
                state: {
                    epoch: temporalEpoch,
                    chipId,
                    previous: {
                        path: location.pathname,
                    },
                },
            } satisfies NavigateOptions);
        } else {
            logging.error('Attempted to load graph but no folder path was available');
        }
    };

    const loadTemporalEpoch = (epoch: number) => {
        if (selectedFolder) {
            dispatch(closeDetailedView());
            navigate('/render', {
                state: {
                    epoch,
                    previous: {
                        path: location.pathname,
                    },
                },
            } satisfies NavigateOptions);
        } else {
            logging.error('Attempted to load epoch but no folder path was available');
        }
    };

    const loadPerfAnalyzerFolder = async (
        folderPath?: string | null,
        folderLocationType: FolderLocationType = 'local',
    ) => {
        if (folderPath) {
            dispatch(setApplicationMode(ApplicationMode.PERF_ANALYZER));
            dispatch(setSelectedFolderLocationType(folderLocationType));

            return loadFolder(folderPath);
        }

        return [] as GraphRelationship[];
    };

    return {
        loadPerfAnalyzerFolder,
        openPerfAnalyzerFolderDialog,
        loadPerfAnalyzerGraph,
        loadTemporalEpoch,
        error,
    };
};

export default usePerfAnalyzerFileLoader;
