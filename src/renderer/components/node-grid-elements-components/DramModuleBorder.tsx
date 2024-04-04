/**
 * SPDX-License-Identifier: Apache-2.0
 * SPDX-FileCopyrightText: © 2024 Tenstorrent Inc.
 */

import { FC } from 'react';
import { useSelector } from 'react-redux';
import { ComputeNode } from '../../../data/GraphOnChip';
import { getDramGroup } from '../../../data/store/selectors/nodeSelection.selectors';
import { getDramGroupingStyles } from '../../../utils/DrawingAPI';

interface DramModuleBorderProps {
    node: ComputeNode;
}

/** For a DRAM node, this renders a styling layer when the node's DRAM group is selected */
const DramModuleBorder: FC<DramModuleBorderProps> = ({ node }) => {
    const dramSelectionState = useSelector(getDramGroup(node.dramChannelId));
    let dramStyles = {};

    if (
        node.dramChannelId > -1 &&
        dramSelectionState &&
        dramSelectionState.selected &&
        dramSelectionState.data.length > 1
    ) {
        const border = dramSelectionState.data.filter((n) => n.id === node.uid)[0]?.border!;

        dramStyles = getDramGroupingStyles(border);
    }

    return <div className='dram-border' style={dramStyles} />;
};

export default DramModuleBorder;
