import { FC } from 'react';
import { useSelector } from 'react-redux';
import { ComputeNode } from '../../../data/Chip';
import { RootState } from '../../../data/store/createStore';
import { getGroupColor } from '../../../data/ColorGenerator';

const QueueHighlightRenderer: FC<{ node: ComputeNode }> = ({ node }) => {
    const queueSelectionState = useSelector((state: RootState) => state.nodeSelection.queues);
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
