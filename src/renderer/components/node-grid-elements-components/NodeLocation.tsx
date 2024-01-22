import { FC } from 'react';
import { useSelector } from 'react-redux';
import { ComputeNode } from '../../../data/Chip';
import { getShowNodeLocation } from '../../../data/store/selectors/uiState.selectors';

export const NodeLocation: FC<{ node: ComputeNode }> = ({ node }) => {
    const showNodeLocation = useSelector(getShowNodeLocation);

    return (
        showNodeLocation && (
            <div className='node-location'>
                {/* {node.loc.x},{node.loc.y} */}
                {node.uid}
            </div>
        )
    );
};

export default NodeLocation;
