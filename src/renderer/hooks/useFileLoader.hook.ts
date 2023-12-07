import { ApplicationMode } from 'data/Types';
import {
    getApplicationMode,
    getAvailableGraphsSelector,
    getFolderPathSelector,
    getGraphNameSelector,
} from 'data/store/selectors/uiState.selectors';
import path from 'path';
import { useSelector } from 'react-redux';
import useNetlistAnalyzerFileLoader from './useNetlistAnalyzerFileLoader.hooks';
import usePerfAnalyzerFileLoader from './usePerfAnalyzerFileLoader.hooks';

type FileLoaderHook = {
    selectedGraph: string;
    handleSelectGraph: (name: string) => void;
    availableGraphs: string[];
};

const useFileLoader = (): FileLoaderHook => {
    const applicationMode = useSelector(getApplicationMode);
    const selectedFolder = useSelector(getFolderPathSelector);
    const selectedGraph = useSelector(getGraphNameSelector);
    const availableGraphs = useSelector(getAvailableGraphsSelector);

    const { loadPerfAnalyzerGraph } = usePerfAnalyzerFileLoader();
    const { loadNetlistFile } = useNetlistAnalyzerFileLoader();

    const handleSelectGraph = (name: string): void => {
        try {
            if (applicationMode === ApplicationMode.NETLIST_ANALYZER) {
                const fileName = path.join(selectedFolder, name);
                loadNetlistFile(fileName);
            } else if (applicationMode === ApplicationMode.PERF_ANALYZER) {
                loadPerfAnalyzerGraph(name);
            }
        } catch (err) {
            const error = err as Error;
            console.error('error switching graphs/netlist', error.message);
        }
    };

    return {
        selectedGraph,
        handleSelectGraph,
        availableGraphs,
    };
};

export default useFileLoader;
