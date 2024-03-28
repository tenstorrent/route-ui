/**
 * SPDX-License-Identifier: Apache-2.0
 * SPDX-FileCopyrightText: © 2024 Tenstorrent Inc.
 */

import { FC, type CSSProperties } from 'react';
import { useSelector } from 'react-redux';
import { getGroupColor } from '../../../data/ColorGenerator';
import { ComputeNode } from '../../../data/GraphOnChip';
import { RootState } from '../../../data/store/createStore';
import { getOperation } from '../../../data/store/selectors/nodeSelection.selectors';
import { getShowOperationNames } from '../../../data/store/selectors/uiState.selectors';
import { getNodeOpBackgroundStyles, getNodeOpBorderStyles } from '../../../utils/DrawingAPI';

interface OperationGroupRenderProps {
    node: ComputeNode;
}

/**
 * Adds a highlight layer to a Core node element when the core's operation ("operation group") is selected.
 */
const OperationGroupRender: FC<OperationGroupRenderProps> = ({ node }) => {
    const selectedGroup = useSelector((state: RootState) => getOperation(state, node.opName));
    const showOperationNames = useSelector(getShowOperationNames);

    let operationStyles: CSSProperties = {};

    if (node.opName !== '' && selectedGroup && (selectedGroup?.selected || showOperationNames)) {
        const color = getGroupColor(node.opName);
        operationStyles = { borderColor: getGroupColor(node.opName) };
        const siblings = selectedGroup.data.filter((n) => n.id === node.uid)[0]?.siblings ?? {};

        operationStyles = getNodeOpBorderStyles({
            node,
            styles: operationStyles,
            color,
            siblings,
            isSelected: selectedGroup.selected,
        });

        if (selectedGroup.selected) {
            operationStyles = getNodeOpBackgroundStyles(operationStyles, color);
        }
    }

    return <div className='group-border' style={operationStyles} />;
};

export default OperationGroupRender;
