// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent AI ULC

import { getOperand, selectNodeSelectionById } from 'data/store/selectors/nodeSelection.selectors';
import { updateNodeSelection } from 'data/store/slices/nodeSelection.slice';
import { openDetailedView } from 'data/store/slices/uiState.slice';
import React, { useContext, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ComputeNode } from '../../data/GraphOnChip';
import { HighlightType } from '../../data/Types';
import { getFocusPipe } from '../../data/store/selectors/pipeSelection.selectors';
import {
    getDetailedViewOpenState,
    getSelectedDetailsViewUID,
    getShowOperationNames,
} from '../../data/store/selectors/uiState.selectors';
import DramModuleBorder from './node-grid-elements-components/DramModuleBorder';
import NodeFocusPipeRenderer from './node-grid-elements-components/NodeFocusPipeRenderer';
import NodeLocation from './node-grid-elements-components/NodeLocation';
import NodeOperationLabel from './node-grid-elements-components/NodeOperationLabel';
import NodePipeRenderer from './node-grid-elements-components/NodePipeRenderer';
import OffChipNodeLinkCongestionLayer from './node-grid-elements-components/OffChipNodeLinkCongestionLayer';
import OperationCongestionLayer from './node-grid-elements-components/OperationCongestionLayer';
import OperationGroupRender from './node-grid-elements-components/OperationGroupRender';
import QueueHighlightRenderer from './node-grid-elements-components/QueueHighlightRenderer';
import { GraphOnChipContext } from '../../data/GraphOnChipContext';

interface NodeGridElementProps {
    node: ComputeNode;
}

const NodeGridElement: React.FC<NodeGridElementProps> = ({ node }) => {
    const graphName = useContext(GraphOnChipContext).getActiveGraphName();
    const dispatch = useDispatch();
    const nodeState = useSelector(selectNodeSelectionById(graphName, node.uid));
    const isOpen = useSelector(getDetailedViewOpenState);
    const uid = useSelector(getSelectedDetailsViewUID);
    const focusPipe = useSelector(getFocusPipe);
    const showOperationNames = useSelector(getShowOperationNames);
    const { data: selectedGroupData } = useSelector(getOperand(node.opName)) ?? {};
    const shouldShowLabel = useMemo(() => {
        const [selectedNodeData] = selectedGroupData?.filter((n) => n.id === node.uid) ?? [];
        // Use the top border to determine if the label should be shown.
        // It will only show for the items that are the "first" in that selected group.
        // This may be either vertical or horizontal, so we cover both the top and left borders.
        return !selectedNodeData?.siblings.top && !selectedNodeData?.siblings.left;
    }, [selectedGroupData, node.uid]);

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



    const triggerSelection = () => {
        const selectedState = nodeState?.selected;
        if (isOpen && selectedState) {
            dispatch(openDetailedView(node.uid));
        } else {
            dispatch(updateNodeSelection({ graphName, id: node.uid, selected: !nodeState?.selected }));
        }
    };

    const classList = ['node-item'];
    if (coreHighlight !== HighlightType.NONE) {
        classList.push(`core-highlight-${coreHighlight}`);
    }
    if (nodeState?.selected) {
        classList.push('selected');
    }
    if (uid === node.uid && isOpen) {
        classList.push('detailed-view');
    }
    return (
        <button
            title={showOperationNames && shouldShowLabel ? node.opName : ''}
            type='button'
            className={classList.join(' ')}
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
