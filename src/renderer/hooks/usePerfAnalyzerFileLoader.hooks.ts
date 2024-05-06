// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent Inc.

import { getFolderPathSelector } from 'data/store/selectors/uiState.selectors';
import {
    closeDetailedView,
    setApplicationMode,
    setIsLoadingFolder,
    setSelectedFolder,
    setSelectedFolderLocationType,
} from 'data/store/slices/uiState.slice';
import { useDispatch, useSelector } from 'react-redux';
import { getAvailableGraphNames, loadCluster, loadGraph, validatePerfResultsFolder } from 'utils/FileLoaders';

import { dialog } from '@electron/remote';
import { ApplicationMode } from 'data/Types';
import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sortPerfAnalyzerGraphnames } from 'utils/FilenameSorters';
import { ClusterContext, ClusterModel } from '../../data/ClusterContext';
import type GraphOnChip from '../../data/GraphOnChip';
import { GraphOnChipContext } from '../../data/GraphOnChipContext';
import type { ComputeNodeState, EpochAndLinkStates, FolderLocationType, PipeSelection } from '../../data/StateTypes';
import {
    initialLoadLinkData,
    initialLoadNormalizedOPs,
    initialLoadTotalOPs,
    resetNetworksState,
} from '../../data/store/slices/linkSaturation.slice';
import { initialLoadAllNodesData } from '../../data/store/slices/nodeSelection.slice';
import { loadPipeSelection, resetPipeSelection } from '../../data/store/slices/pipeSelection.slice';
import { mapIterable } from '../../utils/IterableHelpers';
import useLogging from './useLogging.hook';
import { updateMaxBwLimitedFactor } from '../../data/store/slices/operationPerf.slice';

const usePerfAnalyzerFileLoader = () => {
    const dispatch = useDispatch();
    const selectedFolder = useSelector(getFolderPathSelector);
    const [error, setError] = useState<string | null>(null);
    const logging = useLogging();
    const { setCluster } = useContext<ClusterModel>(ClusterContext);
    const { getActiveGraphOnChip, setActiveGraph, loadGraphOnChips, resetGraphOnChipState } =
        useContext(GraphOnChipContext);
    const activeGraphOnChip = getActiveGraphOnChip();
    const navigate = useNavigate();

    const logger = useLogging();

    useEffect(() => {
        if (activeGraphOnChip) {
            // this needs to be repalced with a more elaborate solution
            dispatch(updateMaxBwLimitedFactor(activeGraphOnChip.details.maxBwLimitedFactor));
        }
    }, [activeGraphOnChip, dispatch]);

    const openPerfAnalyzerFolderDialog = async () => {
        const folderList = dialog.showOpenDialogSync({
            properties: ['openDirectory'],
        });

        const folderPath = folderList?.[0] ?? undefined;
        if (!folderPath) {
            return undefined;
        }

        const [isValid, err] = await validatePerfResultsFolder(folderPath);
        if (!isValid) {
            // eslint-disable-next-line no-alert
            alert(`Invalid folder selected: ${err}`);
            return undefined;
        }

        return folderPath;
    };

    const loadFolder = async (folderPath: string): Promise<void> => {
        resetGraphOnChipState();
        dispatch(resetPipeSelection());
        dispatch(resetNetworksState());
        setError(null);
        dispatch(setIsLoadingFolder(true));

        try {
            // TODO: needs gone once we are happy with performance
            const entireRunStartTime = performance.now();
            const graphs = await getAvailableGraphNames(folderPath);

            if (!graphs.length) {
                throw new Error(`No graphs found in\n${folderPath}`);
            }

            dispatch(setSelectedFolder(folderPath));
            const sortedGraphs = sortPerfAnalyzerGraphnames(graphs);
            const totalOpsPerEpoch: number[] = [];
            const totalOpsNormalized: Record<string, number> = {};
            const graphOnChipList: GraphOnChip[] = [];
            const linkDataByGraphname: Record<string, EpochAndLinkStates> = {};
            const pipeSelectionData: PipeSelection[] = [];
            const totalOpsData: Record<string, number> = {};
            const nodesDataPerGraph: Record<number, ComputeNodeState[]> = {};
            const times = [];
            // eslint-disable-next-line no-restricted-syntax
            for (const graph of sortedGraphs) {
                const start = performance.now();

                // eslint-disable-next-line no-await-in-loop
                const graphOnChip = await loadGraph(folderPath, graph);

                const ops = totalOpsPerEpoch[graph.temporalEpoch] ?? 1;
                totalOpsPerEpoch[graph.temporalEpoch] = Math.max(graphOnChip.totalOpCycles, ops);
                graphOnChipList.push(graphOnChip);
                linkDataByGraphname[graph.name] = {
                    linkStates: graphOnChip.getAllLinks().map((link) => link.generateInitialState()),
                    temporalEpoch: graph.temporalEpoch,
                };
                totalOpsData[graph.name] = graphOnChip.totalOpCycles;
                pipeSelectionData.push(...graphOnChip.generateInitialPipesSelectionState());

                if (!nodesDataPerGraph[graph.temporalEpoch]) {
                    nodesDataPerGraph[graph.temporalEpoch] = [];
                }

                nodesDataPerGraph[graph.temporalEpoch].push(
                    ...mapIterable(graphOnChip.nodes, (node) => node.generateInitialState(graph.name)),
                );

                times.push({
                    graph: `${graph.name}`,
                    time: `${performance.now() - start} ms`,
                });
            }

            sortedGraphs.forEach((graph) => {
                totalOpsNormalized[graph.name] = totalOpsPerEpoch[graph.temporalEpoch] ?? 1;
            });

            loadGraphOnChips(graphOnChipList, sortedGraphs);

            dispatch(initialLoadLinkData(linkDataByGraphname));
            dispatch(loadPipeSelection(pipeSelectionData));
            dispatch(initialLoadTotalOPs(totalOpsData));
            dispatch(initialLoadNormalizedOPs({ perGraph: totalOpsNormalized, perEpoch: totalOpsPerEpoch }));
            dispatch(initialLoadAllNodesData(nodesDataPerGraph));

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
    };

    const loadPerfAnalyzerGraph = (graphName: string) => {
        if (selectedFolder) {
            dispatch(closeDetailedView());
            setActiveGraph(graphName);
            navigate('/render', { state: { graphName } });
        } else {
            logging.error('Attempted to load graph but no folder path was available');
        }
    };

    const loadTemporalEpoch = (epoch: number) => {
        if (selectedFolder) {
            dispatch(closeDetailedView());
            // setActiveGraph(graphName);
            navigate('/render', { state: { epoch } });
        } else {
            logging.error('Attempted to load epoch but no folder path was available');
        }
    }

    const loadPerfAnalyzerFolder = async (
        folderPath?: string | null,
        folderLocationType: FolderLocationType = 'local',
    ): Promise<void> => {
        if (folderPath) {
            dispatch(setApplicationMode(ApplicationMode.PERF_ANALYZER));
            dispatch(setSelectedFolderLocationType(folderLocationType));

            await loadFolder(folderPath);
        }
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
