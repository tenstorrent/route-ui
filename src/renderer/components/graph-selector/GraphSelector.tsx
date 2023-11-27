import { useRenderChip } from 'renderer/hooks/useRenderChip';
import PopoverMenu from '../PopoverMenu';
import { useFolderPicker } from '../../hooks/useFolderPicker.hooks';

function GraphSelector() {
    const { renderFromChip } = useRenderChip();

    const { availableGraphs, selectedGraph, onSelectGraphName } = useFolderPicker(renderFromChip);

    return availableGraphs.length ? (
        <PopoverMenu // Graph picker
            label={selectedGraph}
            options={availableGraphs}
            selectedItem={selectedGraph}
            onSelectItem={onSelectGraphName}
            disabled={false}
        />
    ) : (
        <div>{selectedGraph}</div>
    );
}

export default GraphSelector;
