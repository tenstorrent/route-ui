import { FC } from 'react';
import { useSelector } from 'react-redux';
import { ComputeNode } from '../../../data/Chip';
import { RootState } from '../../../data/store/createStore';
import { getOperation } from '../../../data/store/selectors/nodeSelection.selectors';
import { getShowOperationNames } from '../../../data/store/selectors/uiState.selectors';
import { getGroupColor } from '../../../data/ColorGenerator';
import { getNodeOpBackgroundStyles, getNodeOpBorderStyles } from '../../../utils/DrawingAPI';

interface OperationGroupRenderProps {
    node: ComputeNode;
}

/**
 * Adds a highlight layer to a Core node element when the core's operation ("operation group") is selected.
 */
export const OperationGroupRender: FC<OperationGroupRenderProps> = ({ node }) => {
    const selectedGroup = useSelector((state: RootState) => getOperation(state, node.opName));
    const showOperationNames = useSelector(getShowOperationNames);

    let operationStyles = {};

    if (node.opName !== '' && (selectedGroup?.selected || showOperationNames)) {
        const color = getGroupColor(node.opName);
        operationStyles = { borderColor: getGroupColor(node.opName) };
        const border = selectedGroup.data.filter((n) => n.id === node.uid)[0]?.border;
        operationStyles = getNodeOpBorderStyles(operationStyles, color, border, selectedGroup.selected);

        if (selectedGroup.selected) {
            operationStyles = getNodeOpBackgroundStyles(operationStyles, color);
        }
    }

    return <div className='group-border' style={operationStyles} />;
};

export default OperationGroupRender;
