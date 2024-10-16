// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent AI ULC

import { FC } from 'react';
import { useSelector } from 'react-redux';
import { ComputeNode } from '../../data/GraphOnChip';
import { getShowNodeUID } from '../../data/store/selectors/uiState.selectors';
import { formatNodeUID } from '../../utils/DataUtils';

const NodeLocation: FC<{ node: ComputeNode }> = ({ node }) => {
    const showNodeLocation = useSelector(getShowNodeUID);

    return <div className='node-location'>{showNodeLocation ? formatNodeUID(node.uid) : ''}</div>;
};

export default NodeLocation;
