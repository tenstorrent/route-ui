// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent AI ULC

import { selectNodeSelectionById } from 'data/store/selectors/nodeSelection.selectors';
import { updateNodeSelection } from 'data/store/slices/nodeSelection.slice';
import { openDetailedView } from 'data/store/slices/uiState.slice';
import React from 'react';
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
import OperationCongestionLayer from './node-grid-elements-components/OperationCongestionLayer';
import DramModuleBorder from './node-grid-elements-components/DramModuleBorder';
import NodeOperationLabel from './node-grid-elements-components/NodeOperationLabel';
import OperationGroupRender from './node-grid-elements-components/OperationGroupRender';
import QueueHighlightRenderer from './node-grid-elements-components/QueueHighlightRenderer';
import { ClusterChip } from '../../data/Cluster';
import OffChipNodeLinkCongestionLayer from './node-grid-elements-components/OffChipNodeLinkCongestionLayer';
import NodePipeRenderer from './node-grid-elements-components/NodePipeRenderer';
import NodeFocusPipeRenderer from './node-grid-elements-components/NodeFocusPipeRenderer';
import AsyncComponent from './AsyncRenderer';

interface NodeGridElementProps {
    node: ComputeNode;
    temporalEpoch: number;
    currentChipId?: number;
    connectedEth?: ClusterChip | null;
}

const NodeGridElement: React.FC<NodeGridElementProps> = ({ node, temporalEpoch, currentChipId, connectedEth }) => {
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

    const isConsumer = node.consumerPipes.find(({ id }) => id === focusPipe) !== undefined;
    const isProducer = node.producerPipes.find(({ id }) => id === focusPipe) !== undefined;

    if (isConsumer && isProducer) {
        coreHighlight = HighlightType.BOTH;
    } else if (isConsumer) {
        coreHighlight = HighlightType.OUTPUT;
    } else if (isProducer) {
        coreHighlight = HighlightType.INPUT;
    }

    const highlightClass = coreHighlight === HighlightType.NONE ? '' : `core-highlight-${coreHighlight}`;

    const triggerSelection = () => {
        const selectedState = nodeState?.selected;
        if (isOpen && selectedState) {
            dispatch(openDetailedView({ nodeUid: node.uid, chipId: node.chipId }));
        } else {
            dispatch(updateNodeSelection({ temporalEpoch, id: node.uid, selected: !nodeState?.selected }));
        }
    };

    return (
        <button
            title={showOperationNames && shouldShowLabel ? node.operation?.name : ''}
            type='button'
            className={`node-item ${highlightClass} ${nodeState?.selected ? 'selected' : ''} ${
                node.uid === uid && isOpen ? 'detailed-view' : ''
            } `}
            onClick={triggerSelection}
        >
            {connectedEth !== null && node.externalPipes.length > 0 && (
                <div className='eth-connection'>
                    {/* TEMPORARY OTPUT - we will use this to show engaged eth ports */}
                    {/* <span>ETH {connectedEth?.id}</span> */}
                    {/* {externalPipes.map((pipe) => ( */}
                    {/*    <div key={pipe.id} className='eth-pipe' >{pipe.id}{pipe.linkName}</div> */}
                    {/* ))} */}
                </div>
            )}

            {/* Selected operation borders and backgrounds */}
            <OperationGroupRender node={node} />
            <DramModuleBorder node={node} temporalEpoch={temporalEpoch} />

            {/* Queues */}
            <QueueHighlightRenderer node={node} />

            {/* Highlights and selections */}
            <div className='core-highlight' />
            <div className='node-border' />

            {/* Congestion information */}
            <AsyncComponent renderer={() => <OperationCongestionLayer node={node} />} loadingContent='' />
            <AsyncComponent
                renderer={() => (
                    <OffChipNodeLinkCongestionLayer
                        temporalEpoch={temporalEpoch}
                        chipId={currentChipId}
                        nodeType={node.type}
                        internalLinks={node.internalLinks}
                        dramLinks={node.dramChannel?.links}
                    />
                )}
                loadingContent=''
            />

            {/* Labels for location and operation */}
            <NodeLocation node={node} />
            <NodeOperationLabel
                opName={node.operation?.name ?? ''}
                shouldRender={showOperationNames && shouldShowLabel}
            />

            {/* Pipes */}
            <AsyncComponent
                renderer={() => (
                    <>
                        <NodePipeRenderer node={node} temporalEpoch={temporalEpoch} chipId={currentChipId} />
                        <NodeFocusPipeRenderer node={node} />
                    </>
                )}
                loadingContent=''
            />

            {/* Node type label */}
            <div className={`node-type-label node-type-${node.getNodeLabel()}`}>{node.getNodeLabel()}</div>
        </button>
    );
};

export default NodeGridElement;
