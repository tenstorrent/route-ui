import Chip from 'data/Chip';
import DataSource, { GridContext } from 'data/DataSource';
import { closeDetailedView } from 'data/store/slices/detailedView.slice';
import { loadLinkData, updateTotalOPs } from 'data/store/slices/linkSaturation.slice';
import { loadNodesData } from 'data/store/slices/nodeSelection.slice';
import { loadPipeSelection } from 'data/store/slices/pipeSelection.slice';
import { setSelectedArchitecture } from 'data/store/slices/uiState.slice';
import { useContext } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { mapIterable } from 'utils/IterableHelpers';
import { updateMaxBwLimitedFactor } from '../../data/store/slices/operationPerf.slice';

const usePopulateChipData = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { setChip } = useContext<GridContext>(DataSource);

    const populateChipData = (selectedChip: Chip) => {
        setChip(selectedChip);
        dispatch(updateMaxBwLimitedFactor(selectedChip.details.maxBwLimitedFactor));
        dispatch(closeDetailedView());
        dispatch(setSelectedArchitecture(selectedChip.architecture));
        dispatch(loadPipeSelection(selectedChip.generateInitialPipesSelectionState()));
        dispatch(loadNodesData([...mapIterable(selectedChip.nodes, (node) => node.generateInitialState())]));
        dispatch(loadLinkData(selectedChip.getAllLinks().map((link) => link.generateInitialState())));
        dispatch(updateTotalOPs(selectedChip.totalOpCycles));
        navigate('/render');
    };

    return { populateChipData };
};

export default usePopulateChipData;