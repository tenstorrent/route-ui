// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent Inc.

import { FC } from 'react';
import { useSelector } from 'react-redux';
import { getGroupColor } from '../../../data/ColorGenerator';
import { ComputeNode } from '../../../data/GraphOnChip';
import { getOperandStateList } from '../../../data/store/selectors/nodeSelection.selectors';

const QueueHighlightRenderer: FC<{ node: ComputeNode }> = ({ node }) => {
    const selected = useSelector(getOperandStateList)(node.queueList.map((queue) => queue.name));

    return (
        <div className='queue-highlighter-content'>
            {selected.map((queue, index) => {
                if (queue.selected) {
                    return (
                        <div
                            key={node.queueList[index].name}
                            className='queue-highlighter'
                            style={{ backgroundColor: getGroupColor(node.queueList[index].name) }}
                        />
                    );
                }
                return null;
            })}
        </div>
    );
};

export default QueueHighlightRenderer;
