import Chip from 'data/Chip';
import { closeDetailedView } from 'data/store/slices/detailedView.slice';
import { loadLinkData, updateTotalOPs } from 'data/store/slices/linkSaturation.slice';
import { loadNodesData } from 'data/store/slices/nodeSelection.slice';
import { loadPipeSelection } from 'data/store/slices/pipeSelection.slice';
import { setSelectedArchitecture } from 'data/store/slices/uiState.slice';
import { useDispatch } from 'react-redux';
import { mapIterable } from 'utils/IterableHelpers';
import { updateMaxBwLimitedFactor } from '../../data/store/slices/operationPerf.slice';

const usePopulateChipData = () => {
    const dispatch = useDispatch();
    const populateChipData = (selectedChip: Chip) => {
        dispatch(updateMaxBwLimitedFactor(selectedChip.details.maxBwLimitedFactor));
        dispatch(closeDetailedView());
        dispatch(setSelectedArchitecture(selectedChip.architecture));
        dispatch(loadNodesData([...mapIterable(selectedChip.nodes, (node) => node.generateInitialState())]));
    };

    return { populateChipData };
};

export default usePopulateChipData;
