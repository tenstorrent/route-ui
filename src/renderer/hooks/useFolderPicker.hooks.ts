import {
    getFolderPathSelector,
    getGraphNameSelector,
    getArchitectureSelector,
    getAvailableGraphsSelector,
} from 'data/store/selectors/uiState.selectors';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAvailableGraphNames, loadGraph, loadJsonFile } from 'utils/FileLoaders';
import {
    setSelectedArchitecture,
    setSelectedGraphName,
    setSelectedFolder,
    setAvailableGraphs,
    clearAvailableGraphs,
} from 'data/store/slices/uiState.slice';
import { Architecture } from 'data/Types';
import { MetadataJSON } from 'data/JSONDataTypes';
import path from 'path';
import Chip from 'data/Chip';

export type DataLoadCallback = (data: Chip) => void;

export const useFolderPicker = (onDataLoad: DataLoadCallback) => {
    const dispatch = useDispatch();
    const selectedFolder = useSelector(getFolderPathSelector);
    const selectedGraph = useSelector(getGraphNameSelector);
    const selectedArchitecture = useSelector(getArchitectureSelector);
    const availableGraphs = useSelector(getAvailableGraphsSelector);

    const [error, setError] = useState<string | null>(null);
    const [manualArchitectureSelection, setManualArchitectureSelection] = useState(false);

    const [showGraphSelect, setShowGraphSelect] = useState(false);

    const handleSelectArchitecture = (arch: Architecture) => {
        dispatch(setSelectedArchitecture(arch));
    };

    const loadFolder = async (folderPath: string) => {
        dispatch(clearAvailableGraphs());
        dispatch(setSelectedFolder(folderPath));
        setManualArchitectureSelection(false);

        let metadata: MetadataJSON;
        try {
            metadata = (await loadJsonFile(path.join(folderPath, 'metadata.json'))) as MetadataJSON;
            handleSelectArchitecture(metadata.architecture as Architecture);
        } catch (err) {
            console.warn('Failed to read metadata from folder:', err);
            setManualArchitectureSelection(true);
        }

        let graphs;
        try {
            graphs = await getAvailableGraphNames(folderPath);
        } catch (err) {
            console.error('Failed to read graph names from folder:', err);
            setError(err ? err.toString() : 'Unknown Error');
            return;
        }
        dispatch(setAvailableGraphs(graphs));
        setShowGraphSelect(true);
    };

    const onSelectGraphName = (graphName: string) => {
        dispatch(setSelectedGraphName(graphName));
        if (selectedFolder) {
            loadGraph(selectedFolder, graphName, selectedArchitecture)
                .then((chip) => {
                    setShowGraphSelect(false);
                    onDataLoad(chip);
                    return null;
                })
                .catch((err) => {
                    console.error(err);
                    setError(err);
                });
        } else {
            console.error('Attempted to load graph but no folder path was available');
        }
    };

    return {
        loadFolder,
        selectedFolder,
        selectedGraph,
        selectedArchitecture,
        handleSelectArchitecture,
        manualArchitectureSelection,
        availableGraphs,
        onSelectGraphName,
        showGraphSelect,
        error,
    };
};
