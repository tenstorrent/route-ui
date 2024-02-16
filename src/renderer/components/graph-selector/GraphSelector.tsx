import useFileLoader from 'renderer/hooks/useFileLoader.hook';
import PopoverMenu from '../PopoverMenu';

function GraphSelector() {
    const { selectedGraph, handleSelectGraph, availableGraphs } = useFileLoader();

    return availableGraphs.length ? (
        <PopoverMenu // Graph picker
            label={selectedGraph}
            options={availableGraphs.map((graph) => graph.name)}
            selectedItem={selectedGraph}
            onSelectItem={handleSelectGraph}
            disabled={availableGraphs?.length === 0}
        />
    ) : (
        <div>{selectedGraph}</div>
    );
}

export default GraphSelector;
