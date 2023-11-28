import usePopulateChipData from 'renderer/hooks/usePopulateChipData.hooks';
import PopoverMenu from '../PopoverMenu';
import { useFolderPicker } from '../../hooks/useFolderPicker.hooks';

function GraphSelector() {
    const { populateChipData } = usePopulateChipData();

    const { availableGraphs, selectedGraph, onSelectGraphName } = useFolderPicker(populateChipData);

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
