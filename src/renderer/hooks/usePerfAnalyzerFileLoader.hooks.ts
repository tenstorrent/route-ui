import {
    getAvailableGraphsSelector,
    getFolderPathSelector,
    getGraphNameSelector,
} from 'data/store/selectors/uiState.selectors';
import {
    clearAvailableGraphs,
    setAvailableGraphs,
    setApplicationMode,
    setSelectedArchitecture,
    setSelectedFolder,
    setSelectedGraphName,
} from 'data/store/slices/uiState.slice';
import { useDispatch, useSelector } from 'react-redux';
import { getAvailableGraphNames, loadGraph, validatePerfResultsFolder } from 'utils/FileLoaders';

import { dialog } from '@electron/remote';
import { ApplicationMode } from 'data/Types';
import { useState } from 'react';
import { sortPerfAnalyzerFiles } from 'utils/FilenameSorters';
import usePopulateChipData from './usePopulateChipData.hooks';

type PerfAnalyzerFileLoaderHook = {
    loadPerfAnalyzerFolder: () => Promise<void>;
    loadPerfAnalyzerGraph: (graphName: string) => Promise<void>;
    error: string | null;
    selectedGraph: string;
    availableGraphs: string[];
    enableGraphSelect: boolean;
};

const usePerfAnalyzerFileLoader = (): PerfAnalyzerFileLoaderHook => {
    const { populateChipData } = usePopulateChipData();

    const dispatch = useDispatch();
    const selectedFolder = useSelector(getFolderPathSelector);
    const selectedGraph = useSelector(getGraphNameSelector);
    const availableGraphs = useSelector(getAvailableGraphsSelector);
    const [error, setError] = useState<string | null>(null);
    const [enableGraphSelect, setEnableGraphSelect] = useState(false);

    const selectFolderDialog = async (): Promise<string | null> => {
        const folderList = dialog.showOpenDialogSync({
            properties: ['openDirectory'],
        });

        const folderPath = folderList?.[0] ?? null;
        if (!folderPath) {
            return null;
        }
        const [isValid, err] = await validatePerfResultsFolder(folderPath);
        if (!isValid) {
            alert(`Invalid folder selected: ${err}`);
            return null;
        }
        return folderPath;
    };

    const loadFolderList = async (folderPath: string): Promise<void> => {
        dispatch(clearAvailableGraphs());
        const graphs = await getAvailableGraphNames(folderPath);
        dispatch(setAvailableGraphs(graphs));
    };

    const loadFolder = async (folderPath: string): Promise<void> => {
        try {
            const graphs = await getAvailableGraphNames(folderPath);
            dispatch(setSelectedFolder(folderPath));
            const sortedGraphs = sortPerfAnalyzerFiles(graphs);
            dispatch(setAvailableGraphs(sortedGraphs));
            setEnableGraphSelect(true);
        } catch (e) {
            const err = e as Error;
            console.error('Failed to read graph names from folder:', err.message);
            setError(err.message ?? 'Unknown Error');
        }
    };

    const loadPerfAnalyzerGraph = async (graphName: string): Promise<void> => {
        if (selectedFolder) {
            try {
                const chip = await loadGraph(selectedFolder, graphName);
                setEnableGraphSelect(false);
                populateChipData(chip);
                dispatch(setSelectedGraphName(graphName));
                dispatch(setSelectedArchitecture(chip.architecture));
            } catch (e) {
                const err = e as Error;
                console.error('error loading and populating chip', err.message);
                setError(err.message ?? 'Unknown Error');
            }
        } else {
            console.error('Attempted to load graph but no folder path was available');
        }
    };

    const loadPerfAnalyzerFolder = async (): Promise<void> => {
        const folderPath = await selectFolderDialog();
        if (folderPath) {
            dispatch(setApplicationMode(ApplicationMode.PERF_ANALYZER));
            await loadFolderList(folderPath);
            await loadFolder(folderPath);
        }
    };

    return {
        loadPerfAnalyzerFolder,
        loadPerfAnalyzerGraph,
        error,
        selectedGraph,
        availableGraphs,
        enableGraphSelect,
    };
};

export default usePerfAnalyzerFileLoader;
