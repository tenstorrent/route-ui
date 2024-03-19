import { getFolderPathSelector } from 'data/store/selectors/uiState.selectors';
import { setApplicationMode, setSelectedFolder, setSelectedFolderLocationType } from 'data/store/slices/uiState.slice';
import { useDispatch, useSelector } from 'react-redux';
import { getAvailableGraphNames, loadCluster, loadGraph, validatePerfResultsFolder } from 'utils/FileLoaders';

import { dialog } from '@electron/remote';
import { ApplicationMode } from 'data/Types';
import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sortPerfAnalyzerGraphnames } from 'utils/FilenameSorters';
import type Chip from '../../data/Chip';
import { ChipContext } from '../../data/ChipDataProvider';
import { ClusterContext, ClusterDataSource } from '../../data/DataSource';
import type { FolderLocationType, LinkState, PipeSelection } from '../../data/StateTypes';
import { closeDetailedView } from '../../data/store/slices/detailedView.slice';
import {
    initialLoadLinkData,
    initialLoadTotalOPs,
    resetNetworksState,
    initialLoadNormalizedOPs,
} from '../../data/store/slices/linkSaturation.slice';
import { clearAllNodes } from '../../data/store/slices/nodeSelection.slice';
import { loadPipeSelection, resetPipeSelection } from '../../data/store/slices/pipeSelection.slice';
import useLogging from './useLogging.hook';
import usePopulateChipData from './usePopulateChipData.hooks';

const usePerfAnalyzerFileLoader = () => {
    const { populateChipData } = usePopulateChipData();
    const dispatch = useDispatch();
    const selectedFolder = useSelector(getFolderPathSelector);
    const [error, setError] = useState<string | null>(null);
    const logging = useLogging();
    const { setCluster } = useContext<ClusterContext>(ClusterDataSource);
    const { getActiveChip, setActiveChip, setChips, resetChips } = useContext(ChipContext);

    const chip = getActiveChip();
    const navigate = useNavigate();

    const logger = useLogging();

    useEffect(() => {
        if (chip) {
            // TODO: should we remove this?
            populateChipData(chip);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chip]);

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
        resetChips();
        dispatch(resetPipeSelection());
        dispatch(resetNetworksState());
        setError(null);

        try {
            // TODO: needs gone once we are happy with performance
            const entireRunStartTime = performance.now();
            const graphs = await getAvailableGraphNames(folderPath);

            if (!graphs.length) {
                throw new Error(`No graphs found in\n${folderPath}`);
            }

            dispatch(setSelectedFolder(folderPath));
            const sortedGraphs = sortPerfAnalyzerGraphnames(graphs);
            const totalOpsPerEpoch: Map<number, number> = new Map();
            const totalOpsNormalized: Record<string, number> = {};

            const graphOnChipList: Chip[] = [];
            const linkData: Record<string, LinkState[]> = {};
            const pipeSelectionData: PipeSelection[] = [];
            const totalOpsData: Record<string, number> = {};
            const times = [];
            // eslint-disable-next-line no-restricted-syntax
            for (const graph of sortedGraphs) {
                const start = performance.now();

                // eslint-disable-next-line no-await-in-loop
                const graphOnChip = await loadGraph(folderPath, graph);

                const ops = totalOpsPerEpoch.get(graph.temporalEpoch) ?? 1;
                totalOpsPerEpoch.set(graph.temporalEpoch, Math.max(graphOnChip.totalOpCycles, ops));

                graphOnChipList.push(graphOnChip);
                linkData[graph.name] = graphOnChip.getAllLinks().map((link) => link.generateInitialState());
                totalOpsData[graph.name] = graphOnChip.totalOpCycles;
                pipeSelectionData.push(...graphOnChip.generateInitialPipesSelectionState());

                times.push({
                    graph: `${graph.name}`,
                    time: `${performance.now() - start} ms`,
                });
            }

            sortedGraphs.forEach((graph) => {
                totalOpsNormalized[graph.name] = totalOpsPerEpoch.get(graph.temporalEpoch) ?? 1;
            });

            setChips(graphOnChipList, sortedGraphs);

            dispatch(initialLoadLinkData(linkData));
            dispatch(loadPipeSelection(pipeSelectionData));
            dispatch(initialLoadTotalOPs(totalOpsData));
            dispatch(initialLoadNormalizedOPs(totalOpsNormalized));

            // console.table(times, ['graph', 'time']);
            // console.log('total', performance.now() - entireRunStartTime, 'ms');
            logger.info(`Loaded ${graphs.length} graphs in ${performance.now() - entireRunStartTime} ms`);
        } catch (e) {
            const err = e as Error;
            logging.error(`Failed to read graph names from folder: ${err.message}`);
            setError(err.message ?? 'Unknown Error');
        }

        setCluster(await loadCluster(folderPath));
    };

    const loadPerfAnalyzerGraph = async (graphName: string): Promise<void> => {
        if (selectedFolder) {
            try {
                dispatch(closeDetailedView());
                dispatch(clearAllNodes());
                setActiveChip(graphName);
                navigate('/render');
            } catch (e) {
                const err = e as Error;
                logging.error(`error loading and populating chip ${err.message}`);
                setError(err.message ?? 'Unknown Error');
            }
        } else {
            logging.error('Attempted to load graph but no folder path was available');
        }
    };

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
        error,
    };
};

export default usePerfAnalyzerFileLoader;
