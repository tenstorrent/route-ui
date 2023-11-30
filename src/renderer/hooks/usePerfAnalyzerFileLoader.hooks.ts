import {
    getArchitectureSelector,
    getAvailableGraphsSelector,
    getFolderPathSelector,
    getGraphNameSelector,
} from 'data/store/selectors/uiState.selectors';
import {
    clearAvailableGraphs,
    setAvailableGraphs,
    setSelectedApplication,
    setSelectedArchitecture,
    setSelectedFolder,
    setSelectedGraphName,
} from 'data/store/slices/uiState.slice';
import { useDispatch, useSelector } from 'react-redux';
import { getAvailableGraphNames, loadGraph, validatePerfResultsFolder } from 'utils/FileLoaders';

import { dialog } from '@electron/remote';
import { Application } from 'data/Types';
import { useState } from 'react';
import usePopulateChipData from './usePopulateChipData.hooks';

const usePerfAnalizerFileLoader = () => {
    const { populateChipData } = usePopulateChipData();

    const dispatch = useDispatch();
    const selectedFolder = useSelector(getFolderPathSelector);
    const selectedGraph = useSelector(getGraphNameSelector);
    const selectedArchitecture = useSelector(getArchitectureSelector);
    const availableGraphs = useSelector(getAvailableGraphsSelector);
    const [error, setError] = useState<string | null>(null);
    const [showGraphSelect, setShowGraphSelect] = useState(false);

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

    const loadFolderList = async (folderPath: string) => {
        dispatch(clearAvailableGraphs());
        const graphs = await getAvailableGraphNames(folderPath);
        dispatch(setAvailableGraphs(graphs));
    };

    const loadFolder = async (folderPath: string) => {
        try {
            const graphs = await getAvailableGraphNames(folderPath);
            dispatch(setSelectedFolder(folderPath));
            dispatch(setAvailableGraphs(graphs));
            setShowGraphSelect(true);
        } catch (err) {
            console.error('Failed to read graph names from folder:', err);
            setError(err ? err.toString() : 'Unknown Error');
        }
    };

    const loadPerfAnalyzerGraph = async (graphName: string) => {
        if (selectedFolder) {
            const chip = await loadGraph(selectedFolder, graphName);
            setShowGraphSelect(false);
            populateChipData(chip);
            dispatch(setSelectedGraphName(graphName));
            dispatch(setSelectedArchitecture(chip.architecture));
        } else {
            console.error('Attempted to load graph but no folder path was available');
        }
    };

    const loadPerfAnalyzerFolder = async () => {
        const folderPath = await selectFolderDialog();
        if (folderPath) {
            dispatch(setSelectedApplication(Application.PERF_ANALYZER));
            await loadFolderList(folderPath);
            await loadFolder(folderPath);
        }
    };

    return {
        loadPerfAnalyzerFolder,
        loadPerfAnalyzerGraph,
        error,
        selectedGraph,
        selectedArchitecture,
        availableGraphs,
        showGraphSelect,
    };
};

export default usePerfAnalizerFileLoader;
