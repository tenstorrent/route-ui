// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent Inc.

import { FC } from 'react';
import { useSelector } from 'react-redux';
import { getGroupColor } from '../../../data/ColorGenerator';
import { ComputeNode } from '../../../data/GraphOnChip';
import { getOperand } from '../../../data/store/selectors/nodeSelection.selectors';
import { getShowOperationNames } from '../../../data/store/selectors/uiState.selectors';
import { getNodeOpBackgroundStyles, getNodeOpBorderStyles } from '../../../utils/DrawingAPI';

interface OperationGroupRenderProps {
    node: ComputeNode;
}

/**
 * Adds a highlight layer to a Core node element when the core's operation ("operation group") is selected.
 */
const OperationGroupRender: FC<OperationGroupRenderProps> = ({ node }) => {
    const selectedGroup = useSelector(getOperand(node.opName));
    const showOperationNames = useSelector(getShowOperationNames);
    const color = getGroupColor(node.opName);
    const shouldShowBorder = node.opName !== '' && selectedGroup && (selectedGroup?.selected || showOperationNames);

    return (
        <div
            className='group-border'
            style={{
                borderColor: color,
                ...(shouldShowBorder
                    ? getNodeOpBorderStyles({
                          siblings: node.opSiblingNodes,
                          isSelected: selectedGroup?.selected ?? false,
                      })
                    : {}),
                ...(selectedGroup?.selected ? { ...getNodeOpBackgroundStyles(color) } : {}),
            }}
        />
    );
};

export default OperationGroupRender;
