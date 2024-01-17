import { getAvailableGraphsSelector, getGraphNameSelector } from 'data/store/selectors/uiState.selectors';
import { useSelector } from 'react-redux';
import usePerfAnalyzerFileLoader from './usePerfAnalyzerFileLoader.hooks';
import { GraphRelationshipState } from '../../data/StateTypes';
import useLogging from './useLogging.hook';

type FileLoaderHook = {
    selectedGraph: string;
    handleSelectGraph: (name: string) => void;
    availableGraphs: GraphRelationshipState[];
};

const useFileLoader = (): FileLoaderHook => {
    const logging = useLogging();
    const selectedGraph = useSelector(getGraphNameSelector);
    const availableGraphs = useSelector(getAvailableGraphsSelector);

    const { loadPerfAnalyzerGraph } = usePerfAnalyzerFileLoader();

    const handleSelectGraph = (name: string): void => {
        try {
            loadPerfAnalyzerGraph(name);
        } catch (err) {
            const error = err as Error;
            logging.error(`error switching graphs/netlist ${error.message}`);
        }
    };

    return {
        selectedGraph,
        handleSelectGraph,
        availableGraphs,
    };
};

export default useFileLoader;
