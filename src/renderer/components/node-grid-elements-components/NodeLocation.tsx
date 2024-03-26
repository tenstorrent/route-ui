import { FC } from 'react';
import { useSelector } from 'react-redux';
import { ComputeNode } from '../../../data/GraphOnChip';
import { getShowNodeUID } from '../../../data/store/selectors/uiState.selectors';
import { formatNodeUID } from '../../../utils/DataUtils';

const NodeLocation: FC<{ node: ComputeNode }> = ({ node }) => {
    const showNodeLocation = useSelector(getShowNodeUID);

    return showNodeLocation && <div className='node-location'>{formatNodeUID(node.uid)}</div>;
};

export default NodeLocation;
