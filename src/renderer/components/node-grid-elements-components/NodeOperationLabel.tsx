import { FC } from 'react';
import { useSelector } from 'react-redux';

import { ComputeNode } from '../../../data/GraphOnChip';

import { getGroupColor } from '../../../data/ColorGenerator';
import { RootState } from '../../../data/store/createStore';
import { getOperation } from '../../../data/store/selectors/nodeSelection.selectors';
import { getShowOperationNames } from '../../../data/store/selectors/uiState.selectors';

const NodeOperationLabel: FC<{ node: ComputeNode }> = ({ node }) => {
    const showOperationNames = useSelector(getShowOperationNames);
    const { data: selectedGroupData } = useSelector((state: RootState) => getOperation(state, node.opName)) ?? {};
    const [selectedNodeData] = selectedGroupData?.filter((n) => n.id === node.uid) ?? [];
    // Use the top border to determine if the label should be shown.
    // It will only show for the items that are the "first" in that selected group.
    // This may be either vertical or horizontal, so we cover both the top and left borders.
    const shouldShowLabel = !selectedNodeData?.siblings.top && !selectedNodeData?.siblings.left;

    return (
        node.opName !== '' &&
        showOperationNames &&
        shouldShowLabel && (
            <div className='node-layer op-label' style={{ backgroundColor: getGroupColor(node.opName) }}>
                {node.opName}
            </div>
        )
    );
};

export default NodeOperationLabel;
