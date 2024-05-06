// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent Inc.

import { selectNodeSelectionById } from 'data/store/selectors/nodeSelection.selectors';
import { updateNodeSelection } from 'data/store/slices/nodeSelection.slice';
import { openDetailedView } from 'data/store/slices/uiState.slice';
import React, { useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ComputeNode } from '../../data/GraphOnChip';
import { HighlightType } from '../../data/Types';
import { getFocusPipe } from '../../data/store/selectors/pipeSelection.selectors';
import {
    getDetailedViewOpenState,
    getSelectedDetailsViewUID,
    getShowOperationNames,
} from '../../data/store/selectors/uiState.selectors';
import NodeLocation from './node-grid-elements-components/NodeLocation';
import NodePipeRenderer from './node-grid-elements-components/NodePipeRenderer';
import OperationCongestionLayer from './node-grid-elements-components/OperationCongestionLayer';
import DramModuleBorder from './node-grid-elements-components/DramModuleBorder';
import OffChipNodeLinkCongestionLayer from './node-grid-elements-components/OffChipNodeLinkCongestionLayer';
import NodeOperationLabel from './node-grid-elements-components/NodeOperationLabel';
import OperationGroupRender from './node-grid-elements-components/OperationGroupRender';
import QueueHighlightRenderer from './node-grid-elements-components/QueueHighlightRenderer';
import NodeFocusPipeRenderer from './node-grid-elements-components/NodeFocusPipeRenderer';
import { GraphOnChipContext } from '../../data/GraphOnChipContext';

interface NodeGridElementProps {
    node: ComputeNode;
    graphName: string;
}

const NodeGridElement: React.FC<NodeGridElementProps> = ({ node, graphName }) => {
    // const graphName = useContext(GraphOnChipContext).getActiveGraphName();
    const { temporalEpoch = -1 } = useContext(GraphOnChipContext).getActiveGraphRelationship() ?? {};
    const dispatch = useDispatch();
    const nodeState = useSelector(selectNodeSelectionById(temporalEpoch, node.uid));
    const isOpen = useSelector(getDetailedViewOpenState);
    const uid = useSelector(getSelectedDetailsViewUID);
    const focusPipe = useSelector(getFocusPipe);
    const showOperationNames = useSelector(getShowOperationNames);

    // Use the top border to determine if the label should be shown.
    // It will only show for the items that are the "first" in that selected group.
    // This may be either vertical or horizontal, so we cover both the top and left borders.
    const shouldShowLabel = !node.opSiblingNodes?.top && !node.opSiblingNodes?.left;

    let coreHighlight = HighlightType.NONE;
    const isConsumer = node.consumerPipes.filter((pipe) => pipe.id === focusPipe).length > 0; // ?.consumerCores.includes(node.uid);
    const isProducer = node.producerPipes.filter((pipe) => pipe.id === focusPipe).length > 0; // ?.consumerCores.includes(node.uid);
    if (isConsumer && isProducer) {
        coreHighlight = HighlightType.BOTH;
    } else if (isConsumer) {
        coreHighlight = HighlightType.OUTPUT;
    } else if (isProducer) {
        coreHighlight = HighlightType.INPUT;
    }

    // console.log(nodeState)

    const highlightClass = coreHighlight === HighlightType.NONE ? '' : `core-highlight-${coreHighlight}`;

    const triggerSelection = () => {
        const selectedState = nodeState?.selected;
        if (isOpen && selectedState) {
            dispatch(openDetailedView(node.uid));
        } else {
            dispatch(updateNodeSelection({ temporalEpoch, id: node.uid, selected: !nodeState?.selected }));
        }
    };

    return (
        <button
            title={showOperationNames && shouldShowLabel ? node.opName : ''}
            type='button'
            className={`node-item ${highlightClass} ${nodeState?.selected ? 'selected' : ''} ${
                node.uid === uid && isOpen ? 'detailed-view' : ''
            } `}
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
            <NodePipeRenderer node={node} graphName={graphName} />
            <NodeFocusPipeRenderer node={node} />

            {/* Node type label */}
            <div className={`node-type-label node-type-${node.getNodeLabel()}`}>{node.getNodeLabel()}</div>
        </button>
    );
};

export default NodeGridElement;
