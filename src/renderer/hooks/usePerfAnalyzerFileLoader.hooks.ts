import { getFolderPathSelector } from 'data/store/selectors/uiState.selectors';
import {
    setApplicationMode,
    setAvailableGraphs,
    setSelectedArchitecture,
    setSelectedFolder,
    setSelectedFolderLocationType,
    setSelectedGraphName,
} from 'data/store/slices/uiState.slice';
import { useDispatch, useSelector } from 'react-redux';
import { getAvailableGraphNames, loadCluster, loadGraph, validatePerfResultsFolder } from 'utils/FileLoaders';

import { dialog } from '@electron/remote';
import { ApplicationMode } from 'data/Types';
import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sortPerfAnalyzerGraphnames } from 'utils/FilenameSorters';
import { ChipContext } from '../../data/ChipDataProvider';
import { ClusterContext, ClusterDataSource } from '../../data/DataSource';
import type { FolderLocationType } from '../../data/StateTypes';
import { clearAllNodes } from '../../data/store/slices/nodeSelection.slice';
import { loadPipeSelection, resetPipeSelection } from '../../data/store/slices/pipeSelection.slice';
import useLogging from './useLogging.hook';
import usePopulateChipData from './usePopulateChipData.hooks';
import { closeDetailedView } from '../../data/store/slices/detailedView.slice';
import { loadLinkData, resetNetworksState, updateTotalOPs } from '../../data/store/slices/linkSaturation.slice';

const usePerfAnalyzerFileLoader = () => {
    const { populateChipData } = usePopulateChipData();
    const dispatch = useDispatch();
    const selectedFolder = useSelector(getFolderPathSelector);
    const [error, setError] = useState<string | null>(null);
    const logging = useLogging();
    const { setCluster } = useContext<ClusterContext>(ClusterDataSource);
    const { getActiveChip, setActiveChip, addChip, resetChips } = useContext(ChipContext);

    const chip = getActiveChip();
    const navigate = useNavigate();

    const logger = useLogging();

    useEffect(() => {
        if (chip) {
            dispatch(setSelectedArchitecture(chip.architecture));
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
            dispatch(setAvailableGraphs(sortedGraphs));

            const times = [];
            // eslint-disable-next-line no-restricted-syntax
            for (const graph of sortedGraphs) {
                const start = performance.now();
                // eslint-disable-next-line no-await-in-loop
                const graphOnChip = await loadGraph(folderPath, graph);
                addChip(graphOnChip, graph.name);
                dispatch(loadPipeSelection(graphOnChip.generateInitialPipesSelectionState()));
                const linkData = graphOnChip.getAllLinks().map((link) => link.generateInitialState());
                dispatch(loadLinkData({ graphName: graph.name, linkData }));
                dispatch(updateTotalOPs({ graphName: graph.name, totalOps: graphOnChip.totalOpCycles }));

                times.push({
                    graph: `${graph.name}`,
                    time: `${performance.now() - start} ms`,
                });
            }
            // TODO: calc normalized ops per temporalEpoch
            // dispatch(updateNormalizedOPs)

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
                dispatch(setSelectedGraphName(graphName));
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

    const resetAvailableGraphs = (): void => {
        dispatch(setAvailableGraphs([]));
        dispatch(setSelectedGraphName(''));
    };

    return {
        loadPerfAnalyzerFolder,
        openPerfAnalyzerFolderDialog,
        loadPerfAnalyzerGraph,
        resetAvailableGraphs,
        error,
    };
};

export default usePerfAnalyzerFileLoader;
