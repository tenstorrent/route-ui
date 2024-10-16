// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent AI ULC

import { FC, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getGroupColor } from '../../data/ColorGenerator';
import { ComputeNode } from '../../data/GraphOnChip';
import { getOperandStateList } from '../../data/store/selectors/nodeSelection.selectors';

const QueueHighlightRenderer: FC<{ node: ComputeNode }> = ({ node }) => {
    const queueNameList = useMemo(() => node.queueList.map((queue) => queue.name), [node]);
    const selected = useSelector(getOperandStateList)(queueNameList);
    const selectedNodes = useMemo(
        () =>
            selected.map((queue, index) => (
                <div
                    key={node.queueList[index]?.name}
                    className='queue-highlighter'
                    style={{
                        backgroundColor: queue.selected
                            ? getGroupColor(node.queueList[index]?.name ?? '')
                            : 'transparent',
                    }}
                />
            )),
        [node.queueList, selected],
    );

    return <div className='queue-highlighter-content'>{selectedNodes}</div>;
};

export default QueueHighlightRenderer;
