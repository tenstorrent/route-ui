import { FC, useContext } from 'react';
import { GraphOnChipContext } from '../../../data/GraphOnChipDataProvider';
import usePerfAnalyzerFileLoader from '../../hooks/usePerfAnalyzerFileLoader.hooks';
import PopoverMenu from '../PopoverMenu';

interface GraphSelectorProps {
    disabled?: boolean;
    label?: string;
    onSelectGraph?: (graph: string) => void;
    autoLoadFistGraph?: boolean;
}


// TODO: this is not useing the correct value for data
const GraphSelector: FC<GraphSelectorProps> = ({ disabled, label, onSelectGraph, autoLoadFistGraph }) => {
    const { getGraphName, chipState } = useContext(GraphOnChipContext);
    const { loadPerfAnalyzerGraph } = usePerfAnalyzerFileLoader();
    const selectedGraph = getGraphName();
    const availableGraphs = Object.keys(chipState.chips);

    if (autoLoadFistGraph && !selectedGraph && availableGraphs?.length > 0) {
        loadPerfAnalyzerGraph(availableGraphs[0]);
    }

    return (
        <PopoverMenu // Graph picker
            label={selectedGraph || (label ?? 'Select graph')}
            options={availableGraphs}
            selectedItem={selectedGraph}
            onSelectItem={async (graph) => {
                await loadPerfAnalyzerGraph(graph);
                onSelectGraph?.(graph);
            }}
            disabled={disabled || availableGraphs?.length === 0}
        />
    );
};

GraphSelector.defaultProps = {
    disabled: false,
    label: undefined,
    onSelectGraph: undefined,
    autoLoadFistGraph: false,
};

export default GraphSelector;
