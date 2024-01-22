import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectNodeSelectionById } from 'data/store/selectors/nodeSelection.selectors';
import { openDetailedView } from 'data/store/slices/detailedView.slice';
import { updateNodeSelection } from 'data/store/slices/nodeSelection.slice';
import { RootState } from 'data/store/createStore';
import { ComputeNode } from '../../data/Chip';
import { HighlightType } from '../../data/Types';
import { NodeOperationLabel } from './node-grid-elements-components/NodeOperationLabel';
import { OperationCongestionLayer } from './node-grid-elements-components/OperationCongestionLayer';
import { DramModuleBorder } from './node-grid-elements-components/DramModuleBorder';
import { OffChipNodeLinkCongestionLayer } from './node-grid-elements-components/OffChipNodeLinkCongestionLayer';
import { OperationGroupRender } from './node-grid-elements-components/OperationGroupRender';
import { NodeFocusPipeRenderer } from './node-grid-elements-components/NodeFocusPipeRenderer';
import { NodePipeRenderer } from './node-grid-elements-components/NodePipeRenderer';
import { QueueHighlightRenderer } from './node-grid-elements-components/QueueHighlightRenderer';

interface NodeGridElementProps {
    node: ComputeNode;
    showEmptyLinks: boolean;
    showNodeLocation: boolean;
    showLinkSaturation: boolean;
    linkSaturationTreshold: number;
}

const NodeGridElement: React.FC<NodeGridElementProps> = ({
    node,
    showEmptyLinks,
    showNodeLocation,
    showLinkSaturation,
    linkSaturationTreshold,
}) => {
    const dispatch = useDispatch();
    const nodeState = useSelector((state: RootState) => selectNodeSelectionById(state, node.uid));
    const { isOpen, uid } = useSelector((state: RootState) => state.detailedView);
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
        const selectedState = nodeState.selected;
        if (isOpen && selectedState) {
            dispatch(openDetailedView(node.uid));
        } else {
            dispatch(updateNodeSelection({ id: node.uid, selected: !nodeState.selected }));
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
            <OperationCongestionLayer node={node} />
            <OperationGroupRender node={node} />
            <DramModuleBorder node={node} />
            <OffChipNodeLinkCongestionLayer
                node={node}
                showLinkSaturation={showLinkSaturation}
                linkSaturationTreshold={linkSaturationTreshold}
            />
            <QueueHighlightRenderer node={node} />
            <div className='node-border' />
            <div className='core-highlight' />
            <NodeFocusPipeRenderer node={node} />
            <NodePipeRenderer
                node={node}
                showEmptyLinks={showEmptyLinks}
                showLinkSaturation={showLinkSaturation}
                linkSaturationTreshold={linkSaturationTreshold}
            />
            {showNodeLocation && (
                <div className='node-location'>
                    {/* {node.loc.x},{node.loc.y} */}
                    {node.uid}
                </div>
            )}
            <div className={`node-type-label node-type-${node.getNodeLabel()}`}>{node.getNodeLabel()}</div>
            <NodeOperationLabel node={node} />
        </button>
    );
};

export default NodeGridElement;
