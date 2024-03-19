import { RootState } from 'data/store/createStore';
import { selectNodeSelectionById } from 'data/store/selectors/nodeSelection.selectors';
import { updateNodeSelection } from 'data/store/slices/nodeSelection.slice';
import { openDetailedView } from 'data/store/slices/uiState.slice';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ComputeNode } from '../../data/Chip';
import { HighlightType } from '../../data/Types';
import { getDetailedViewOpenState, getSelectedDetailsViewUID } from '../../data/store/selectors/uiState.selectors';
import DramModuleBorder from './node-grid-elements-components/DramModuleBorder';
import NodeFocusPipeRenderer from './node-grid-elements-components/NodeFocusPipeRenderer';
import NodeLocation from './node-grid-elements-components/NodeLocation';
import NodeOperationLabel from './node-grid-elements-components/NodeOperationLabel';
import NodePipeRenderer from './node-grid-elements-components/NodePipeRenderer';
import OffChipNodeLinkCongestionLayer from './node-grid-elements-components/OffChipNodeLinkCongestionLayer';
import OperationCongestionLayer from './node-grid-elements-components/OperationCongestionLayer';
import OperationGroupRender from './node-grid-elements-components/OperationGroupRender';
import QueueHighlightRenderer from './node-grid-elements-components/QueueHighlightRenderer';

interface NodeGridElementProps {
    node: ComputeNode;
}

const NodeGridElement: React.FC<NodeGridElementProps> = ({ node }) => {
    const dispatch = useDispatch();
    const nodeState = useSelector((state: RootState) => selectNodeSelectionById(state, node.uid));
    const isOpen = useSelector(getDetailedViewOpenState);
    const uid = useSelector(getSelectedDetailsViewUID);
    const focusPipe = useSelector((state: RootState) => state.pipeSelection.focusPipe);

    let coreHighlight = HighlightType.NONE;
    const isConsumer = node.consumerPipes.filter((pipe) => pipe.id === focusPipe).length > 0; // ?.consumerCores.includes(node.uid);
    const isProducer = node.producerPipes.filter((pipe) => pipe.id === focusPipe).length > 0; // ?.consumerCores.includes(node.uid);
    if (isConsumer) {
        coreHighlight = HighlightType.OUTPUT;
    }
    if (isProducer) {
        coreHighlight = HighlightType.INPUT;
    }
    const highlightClass = coreHighlight === HighlightType.NONE ? '' : `core-highlight-${coreHighlight}`;

    const triggerSelection = () => {
        const selectedState = nodeState?.selected;
        if (isOpen && selectedState) {
            dispatch(openDetailedView(node.uid));
        } else {
            dispatch(updateNodeSelection({ id: node.uid, selected: !nodeState?.selected }));
        }
    };

    return (
        <button
            type='button'
            className={`node-item ${highlightClass} ${nodeState?.selected ? 'selected' : ''} ${
                node.uid === uid && isOpen ? 'detailed-view' : ''
            }`}
            onClick={triggerSelection}
        >
            {/* Selected operation borders and backgrounds */}
            <OperationGroupRender node={node} />
            <DramModuleBorder node={node} />

            {/* Queues */}
            <QueueHighlightRenderer node={node} />

            {/* Highlights and selections */}
            <div className='core-highlight' />
            <div className='node-border' />

            {/* Congestion information */}
            <OperationCongestionLayer node={node} />
            <OffChipNodeLinkCongestionLayer node={node} />

            {/* Labels for location and operation */}
            <NodeLocation node={node} />
            <NodeOperationLabel node={node} />

            {/* Pipes */}
            <NodePipeRenderer node={node} />
            <NodeFocusPipeRenderer node={node} />

            {/* Node type label */}
            <div className={`node-type-label node-type-${node.getNodeLabel()}`}>{node.getNodeLabel()}</div>
        </button>
    );
};

export default NodeGridElement;
