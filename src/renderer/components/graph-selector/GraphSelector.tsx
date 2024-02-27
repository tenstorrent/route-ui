import { FC } from 'react';
import usePerfAnalyzerFileLoader from '../../hooks/usePerfAnalyzerFileLoader.hooks';
import PopoverMenu from '../PopoverMenu';

interface GraphSelectorProps {
    disabled?: boolean;
    label?: string;
    onSelectGraph?: (graph: string) => void;
}

const GraphSelector: FC<GraphSelectorProps> = ({ disabled, label, onSelectGraph }) => {
    const { selectedGraph, loadPerfAnalyzerGraph, availableGraphs } = usePerfAnalyzerFileLoader();

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
};

export default GraphSelector;
