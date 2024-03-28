/**
 * SPDX-License-Identifier: Apache-2.0
 * SPDX-FileCopyrightText: © 2024 Tenstorrent Inc.
 */

import { FC } from 'react';
import { useSelector } from 'react-redux';
import { getGroupColor } from '../../../data/ColorGenerator';
import { ComputeNode } from '../../../data/GraphOnChip';
import { getSelectedQueueList } from '../../../data/store/selectors/nodeSelection.selectors';

const QueueHighlightRenderer: FC<{ node: ComputeNode }> = ({ node }) => {
    const queueSelectionState = useSelector(getSelectedQueueList);
    return (
        <div className='queue-highlighter-content'>
            {node.queueList.map((queue) => {
                if (queueSelectionState[queue.name]?.selected) {
                    return (
                        <div
                            key={queue.name}
                            className='queue-highlighter'
                            style={{ backgroundColor: getGroupColor(queue.name) }}
                        />
                    );
                }
                return null;
            })}
        </div>
    );
};

export default QueueHighlightRenderer;
