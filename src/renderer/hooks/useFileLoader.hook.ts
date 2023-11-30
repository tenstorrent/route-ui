import { Application } from 'data/Types';
import {
    getApplicationSelector,
    getArchitectureSelector,
    getAvailableGraphsSelector,
    getFolderPathSelector,
    getGraphNameSelector,
} from 'data/store/selectors/uiState.selectors';
import path from 'path';
import { useSelector } from 'react-redux';
import useNetlistAnalizerFileLoader from './useNetlistAnalyzerFileLoader.hooks';
import usePerfAnalizerFileLoader from './usePerfAnalyzerFileLoader.hooks';

const useFileLoader = () => {
    const selectedApplication = useSelector(getApplicationSelector);
    const selectedFolder = useSelector(getFolderPathSelector);
    const selectedGraph = useSelector(getGraphNameSelector);
    const selectedArchitecture = useSelector(getArchitectureSelector);
    const availableGraphs = useSelector(getAvailableGraphsSelector);

    const { loadPerfAnalyzerGraph } = usePerfAnalizerFileLoader();
    const { loadNetlistFile } = useNetlistAnalizerFileLoader();

    const handleSelectGraph = (name: string) => {
        if (selectedApplication === Application.NETLIST_ANALYZER) {
            const fileName = path.join(selectedFolder, name);
            loadNetlistFile(fileName);
        } else if (selectedApplication === Application.PERF_ANALYZER) {
            loadPerfAnalyzerGraph(name);
        }
    };

    return {
        selectedFolder,
        selectedGraph,
        selectedArchitecture,
        handleSelectGraph,
        availableGraphs,
    };
};

export default useFileLoader;
