// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent Inc.

import { FC } from 'react';
import { getGroupColor } from '../../../data/ColorGenerator';
import { ComputeNode } from '../../../data/GraphOnChip';
import useSelectableGraphVertex from '../../hooks/useSelectableGraphVertex.hook';

const QueueHighlightRenderer: FC<{ node: ComputeNode }> = ({ node }) => {
    const { selected } = useSelectableGraphVertex();

    return (
        <div className='queue-highlighter-content'>
            {node.queueList.map((queue) => {
                if (selected(queue.name)) {
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
