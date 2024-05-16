// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent Inc.

import { selectNodeSelectionById } from 'data/store/selectors/nodeSelection.selectors';
import { updateNodeSelection } from 'data/store/slices/nodeSelection.slice';
import { openDetailedView } from 'data/store/slices/uiState.slice';
import React, { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ComputeNode } from '../../data/GraphOnChip';
import { EthernetLinkName, HighlightType } from '../../data/Types';
import { getFocusPipe } from '../../data/store/selectors/pipeSelection.selectors';
import {
    getDetailedViewOpenState,
    getHighContrastState,
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
import { getShowOperationPerformanceGrid } from '../../data/store/selectors/operationPerf.selectors';
import { getAllLinksForGraph, getShowLinkSaturation } from '../../data/store/selectors/linkSaturation.selectors';
import NodePipeRenderer from './node-grid-elements-components/NodePipeRenderer';
import NodeFocusPipeRenderer from './node-grid-elements-components/NodeFocusPipeRenderer';

interface NodeGridElementProps {
    node: ComputeNode;
    graphName: string;
    temporalEpoch: number;
    connectedEth?: ClusterChip | null;
}

const NodeGridElement: React.FC<NodeGridElementProps> = ({ node, graphName, temporalEpoch, connectedEth }) => {
    // const graphName = useContext(GraphOnChipContext).getActiveGraphName();
    const dispatch = useDispatch();
    const nodeState = useSelector(selectNodeSelectionById(temporalEpoch, node.uid));
    const isOpen = useSelector(getDetailedViewOpenState);
    const uid = useSelector(getSelectedDetailsViewUID);
    const focusPipe = useSelector(getFocusPipe);
    const showOperationNames = useSelector(getShowOperationNames);
    const shouldRenderOpPerf = useSelector(getShowOperationPerformanceGrid);
    const isHighContrast = useSelector(getHighContrastState);
    const showLinkSaturation = useSelector(getShowLinkSaturation);

    // TODO: pre-calculate link saturation and memoize it
    const linksData = useSelector(getAllLinksForGraph(graphName));

    // Use the top border to determine if the label should be shown.
    // It will only show for the items that are the "first" in that selected group.
    // This may be either vertical or horizontal, so we cover both the top and left borders.
    const shouldShowLabel = !node.opSiblingNodes?.top && !node.opSiblingNodes?.left;

    let coreHighlight = HighlightType.NONE;
    // TODO: invert logic to avoid recomputing consumer/producer cores. Simply check if the node id matches
    const isConsumer = node.consumerPipes.filter((pipe) => pipe.id === focusPipe).length > 0; // ?.consumerCores.includes(node.uid);
    const isProducer = node.producerPipes.filter((pipe) => pipe.id === focusPipe).length > 0; // ?.consumerCores.includes(node.uid);
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

    // TODO: pre-calculate external pipes
    const externalPipes = useMemo(() => {
        if (connectedEth === null) {
            return [];
        }
        return node
            .getInternalLinksForNode()
            .filter((link) => link.name === EthernetLinkName.ETH_IN || link.name === EthernetLinkName.ETH_OUT)
            .map((link) => link.pipes)
            .flat();
    }, [connectedEth, node]);

    return (
        <button
            title={showOperationNames && shouldShowLabel ? node.opName : ''}
            type='button'
            className={`node-item ${highlightClass} ${nodeState?.selected ? 'selected' : ''} ${
                node.uid === uid && isOpen ? 'detailed-view' : ''
            } `}
            onClick={triggerSelection}
        >
            {connectedEth !== null && externalPipes.length > 0 && (
                <div className='eth-connection'>
                    {/* TEMPORARY OTPUT */}
                    <span>ETH {connectedEth?.id}</span>
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
            <OperationCongestionLayer node={node} isHighContrast={isHighContrast} shouldRender={shouldRenderOpPerf} />
            <OffChipNodeLinkCongestionLayer
                node={node}
                linksData={linksData}
                showLinkSaturation={showLinkSaturation}
                isHighContrast={isHighContrast}
            />

            {/* Labels for location and operation */}
            <NodeLocation node={node} />
            <NodeOperationLabel opName={node.opName} shouldRender={showOperationNames && shouldShowLabel} />

            {/* Pipes */}
            <NodePipeRenderer
                node={node}
                isHighContrast={isHighContrast}
                showLinkSaturation={showLinkSaturation}
                linksData={linksData}
            />
            <NodeFocusPipeRenderer node={node} />

            {/* Node type label */}
            <div className={`node-type-label node-type-${node.getNodeLabel()}`}>{node.getNodeLabel()}</div>
        </button>
    );
};
NodeGridElement.defaultProps = {
    connectedEth: null,
};
export default NodeGridElement;
