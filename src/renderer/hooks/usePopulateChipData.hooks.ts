import GraphOnChip from 'data/GraphOnChip';
import { loadNodesData } from 'data/store/slices/nodeSelection.slice';
import { closeDetailedView } from 'data/store/slices/uiState.slice';
import { useDispatch } from 'react-redux';
import { mapIterable } from 'utils/IterableHelpers';
import { updateMaxBwLimitedFactor } from '../../data/store/slices/operationPerf.slice';

const usePopulateChipData = () => {
    const dispatch = useDispatch();
    const populateChipData = (selectedChip: GraphOnChip) => {
        dispatch(updateMaxBwLimitedFactor(selectedChip.details.maxBwLimitedFactor));
        dispatch(closeDetailedView());
        dispatch(loadNodesData([...mapIterable(selectedChip.nodes, (node) => node.generateInitialState())]));
    };

    return { populateChipData };
};

export default usePopulateChipData;
