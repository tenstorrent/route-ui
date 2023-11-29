import {
    getArchitectureSelector,
    getAvailableGraphsSelector,
    getFolderPathSelector,
    getGraphNameSelector,
} from 'data/store/selectors/uiState.selectors';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAvailableGraphNames, loadGraph } from 'utils/FileLoaders';
import {
    clearAvailableGraphs,
    setAvailableGraphs,
    setSelectedFolder,
    setSelectedGraphName,
} from 'data/store/slices/uiState.slice';
import Chip from 'data/Chip';

export type DataLoadCallback = (data: Chip) => void;

export const useFolderPicker = (onDataLoad: DataLoadCallback) => {
    const dispatch = useDispatch();
    const selectedFolder = useSelector(getFolderPathSelector);
    const selectedGraph = useSelector(getGraphNameSelector);
    const selectedArchitecture = useSelector(getArchitectureSelector);
    const availableGraphs = useSelector(getAvailableGraphsSelector);
    const [error, setError] = useState<string | null>(null);
    const [showGraphSelect, setShowGraphSelect] = useState(false);

    const loadFolder = async (folderPath: string) => {
        dispatch(clearAvailableGraphs());
        dispatch(setSelectedFolder(folderPath));


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
            loadGraph(selectedFolder, graphName)
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
        availableGraphs,
        onSelectGraphName,
        showGraphSelect,
        error,
    };
};
