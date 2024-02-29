import {
    getAvailableGraphsSelector,
    getFolderPathSelector,
    getGraphNameSelector,
} from 'data/store/selectors/uiState.selectors';
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

const usePerfAnalyzerFileLoader = () => {
    const { populateChipData } = usePopulateChipData();
    const dispatch = useDispatch();
    const selectedFolder = useSelector(getFolderPathSelector);
    const selectedGraph = useSelector(getGraphNameSelector);
    const availableGraphs = useSelector(getAvailableGraphsSelector);
    const [error, setError] = useState<string | null>(null);
    const logging = useLogging();
    const { setCluster } = useContext<ClusterContext>(ClusterDataSource);
    const { getActiveChip, setActiveChip, addChip, resetChips } = useContext(ChipContext);

    const chip = getActiveChip();
    const navigate = useNavigate();

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
        setError(null);

        try {
            const graphs = await getAvailableGraphNames(folderPath);

            if (!graphs.length) {
                throw new Error(`No graphs found in\n${folderPath}`);
            }

            dispatch(setSelectedFolder(folderPath));
            const sortedGraphs = sortPerfAnalyzerGraphnames(graphs);
            dispatch(setAvailableGraphs(sortedGraphs));
            // TODO: ensure this is not needed
            // setEnableGraphSelect(true);

            sortedGraphs.forEach(async (graph) => {
                const graphOnChip = await loadGraph(folderPath, graph);
                addChip(graphOnChip, graph.name);
                dispatch(loadPipeSelection(graphOnChip.generateInitialPipesSelectionState()));
            });
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
        selectedGraph,
        availableGraphs,
    };
};

export default usePerfAnalyzerFileLoader;
