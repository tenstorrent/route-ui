import { FC } from 'react';
import usePerfAnalyzerFileLoader from '../../hooks/usePerfAnalyzerFileLoader.hooks';
import PopoverMenu from '../PopoverMenu';

interface GraphSelectorProps {
    disabled?: boolean;
    label?: string;
    onSelectGraph?: (graph: string) => void;
    autoLoadFistGraph?: boolean;
}

const GraphSelector: FC<GraphSelectorProps> = ({ disabled, label, onSelectGraph, autoLoadFistGraph }) => {
    const { selectedGraph, loadPerfAnalyzerGraph, availableGraphs } = usePerfAnalyzerFileLoader();

    if (autoLoadFistGraph && !selectedGraph && availableGraphs?.length > 0) {
        loadPerfAnalyzerGraph(availableGraphs[0].name);
    }

    return (
        <PopoverMenu // Graph picker
            label={selectedGraph || (label ?? 'Select graph')}
            options={availableGraphs.map((graph) => graph.name)}
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
