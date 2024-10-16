// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent AI ULC

import { FC } from 'react';
import { useSelector } from 'react-redux';
import { ComputeNode } from '../../data/GraphOnChip';
import { getDramHighlightState } from '../../data/store/selectors/nodeSelection.selectors';
import { getDramGroupingStyles } from '../../utils/DrawingAPI';

interface DramModuleBorderProps {
    node: ComputeNode;
    temporalEpoch: number;
}

/** For a DRAM node, this renders a styling layer when the node's DRAM group is selected */
const DramModuleBorder: FC<DramModuleBorderProps> = ({ node, temporalEpoch }) => {
    const isDramSelected = useSelector(getDramHighlightState(temporalEpoch, node.uid));
    let dramStyles = {};

    if (isDramSelected) {
        dramStyles = getDramGroupingStyles(node.dramBorder);
    }

    return <div className='dram-border' style={dramStyles} />;
};

export default DramModuleBorder;
