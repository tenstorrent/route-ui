import React, { useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as d3 from 'd3';
import { getDramGroup, getOperation, selectNodeSelectionById } from 'data/store/selectors/nodeSelection.selectors';
import { getHighContrastState, getShowOperationNames } from 'data/store/selectors/uiState.selectors';
import { openDetailedView } from 'data/store/slices/detailedView.slice';
import { updateNodeSelection } from 'data/store/slices/nodeSelection.slice';
import { RootState } from 'data/store/createStore';
import { ComputeNode } from '../../data/Chip';
import {
    calculateLinkCongestionColor,
    calculateOpCongestionColor,
    drawLink,
    drawNOCRouter,
    drawSelections,
    getDramGroupingStyles,
    getNodeOpBackgroundStyles,
    getNodeOpBorderStyles,
    getOffChipCongestionStyles,
    NOC_CONFIGURATION,
    NODE_SIZE,
    toRGBA,
} from '../../utils/DrawingAPI';
import { getGroupColor } from '../../data/ColorGenerator';
import { PipeSelection } from '../../data/StateTypes';
import { ComputeNodeType, HighlightType, NOC, NOCLinkName } from '../../data/Types';
import {
    getOperationPerformanceTreshold,
    getShowOperationPerformanceGrid,
} from '../../data/store/selectors/operationPerf.selectors';
import { NodeOperationLabel } from './node-grid/NodeOperationLabel';

interface NodeGridElementProps {
    node: ComputeNode;
    showEmptyLinks: boolean;
    showNodeLocation: boolean;
    showLinkSaturation: boolean;
    linkSaturationTreshold: number;
}

const NodeGridElement: React.FC<NodeGridElementProps> = ({
    //
    node,
    showEmptyLinks,
    showNodeLocation,
    showLinkSaturation,
    linkSaturationTreshold,
    //
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

const OperationCongestionLayer: React.FC<{ node: ComputeNode }> = ({ node }) => {
    const render = useSelector((state: RootState) => getShowOperationPerformanceGrid(state));
    const threshold = useSelector((state: RootState) => getOperationPerformanceTreshold(state));
    const isHighContrast: boolean = useSelector(getHighContrastState);

    if (!render) {
        return null;
    }

    if (node.type !== ComputeNodeType.CORE || node.opName === '') {
        return null;
    }

    const opFactor = node.perfAnalyzerResults?.bw_limited_factor || 1;

    if (opFactor > threshold) {
        const congestionColor = toRGBA(calculateOpCongestionColor(opFactor, 0, isHighContrast), 0.5);
        return (
            <div className='operation-congestion' style={{ backgroundColor: congestionColor }}>
                {opFactor}
            </div>
        );
    }
    return <div className='operation-congestion' />;
};

interface DramModuleBorderProps {
    node: ComputeNode;
}

/** For a DRAM node, this renders a styling layer when the node's DRAM group is selected */
const DramModuleBorder: React.FC<DramModuleBorderProps> = ({ node }) => {
    const dramSelectionState = useSelector((state: RootState) => getDramGroup(state, node.dramChannelId));
    let dramStyles = {};
    if (
        node.dramChannelId > -1 &&
        dramSelectionState &&
        dramSelectionState.selected &&
        dramSelectionState.data.length > 1
    ) {
        const border = dramSelectionState.data.filter((n) => n.id === node.uid)[0]?.border;
        dramStyles = getDramGroupingStyles(border);
    }

    return <div className='dram-border' style={dramStyles} />;
};

interface OffChipNodeLinkCongestionLayerProps {
    node: ComputeNode;
    showLinkSaturation: boolean;
    linkSaturationTreshold: number;
}

/**
 * This renders a congestion layer for nodes with off chip links (DRAM, Ethernet, PCIe)  for those links
 * @param node
 * @param showLinkSaturation
 * @param linkSaturationTreshold
 * @constructor
 */
const OffChipNodeLinkCongestionLayer: React.FC<OffChipNodeLinkCongestionLayerProps> = ({
    //
    node,
    showLinkSaturation,
    linkSaturationTreshold,
}) => {
    const linksData = useSelector((state: RootState) => state.linkSaturation.links);
    const isHighContrast = useSelector(getHighContrastState);
    if (!showLinkSaturation) {
        return null;
    }
    let congestionStyle = {};
    const { type } = node;
    let offChipLinkIds: string[] = [];
    switch (type) {
        case ComputeNodeType.DRAM:
            offChipLinkIds =
                node.dramChannel?.links.map((link) => {
                    return link.uid;
                }) || [];
            break;
        case ComputeNodeType.ETHERNET:
            offChipLinkIds =
                [...node.internalLinks.values()].map((link) => {
                    return link.uid;
                }) || [];
            break;

        case ComputeNodeType.PCIE:
            offChipLinkIds =
                [...node.internalLinks].map(([link]) => {
                    return link.uid;
                }) || [];
            break;
        default:
            return null;
    }

    const saturationValues = offChipLinkIds.map((linkId) => linksData[linkId]?.saturation) || [0];
    const saturation = Math.max(...saturationValues) || 0;
    if (saturation < linkSaturationTreshold) {
        return null;
    }
    const congestionColor = calculateLinkCongestionColor(saturation, 0, isHighContrast);
    const saturationBg = toRGBA(congestionColor, 0.5);
    congestionStyle = getOffChipCongestionStyles(saturationBg);

    return <div className='off-chip-congestion' style={congestionStyle} />;
};

const QueueHighlightRenderer: React.FC<{ node: ComputeNode }> = ({ node }) => {
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

interface OperationGroupRenderProps {
    node: ComputeNode;
}

/** Adds a highlight layer to a Core node element when the core's operation ("operation group") is selected. */
const OperationGroupRender: React.FC<OperationGroupRenderProps> = ({
    //
    node,
    //
}) => {
    const selectedGroup = useSelector((state: RootState) => getOperation(state, node.opName));
    const showOperationNames = useSelector(getShowOperationNames);

    let operationStyles = {};

    if (node.opName !== '' && (selectedGroup?.selected || showOperationNames)) {
        const color = getGroupColor(node.opName);
        operationStyles = { borderColor: getGroupColor(node.opName) };
        const border = selectedGroup.data.filter((n) => n.id === node.uid)[0]?.border;
        operationStyles = getNodeOpBorderStyles(operationStyles, color, border, selectedGroup.selected);

        if (selectedGroup.selected) {
            operationStyles = getNodeOpBackgroundStyles(operationStyles, color);
        }
    }

    return <div className='group-border' style={operationStyles} />;
};

interface NodeFocusPipeRendererProps {
    node: ComputeNode;
}

const NodeFocusPipeRenderer: React.FC<NodeFocusPipeRendererProps> = ({
    //
    node,
    //
}) => {
    // TODO: note to future self this is working incidently, but once gridview starts being generated later or regenerated this will likely need a useEffect
    const svgRef = useRef<SVGSVGElement | null>(null);
    const svg = d3.select(svgRef.current);
    const focusPipe = useSelector((state: RootState) => state.pipeSelection.focusPipe);
    const focusedPipeIds = [focusPipe || ''];

    svg.selectAll('*').remove();
    if (focusPipe && node.pipes.filter((pipe) => pipe.id === focusPipe).length > 0) {
        drawSelections(svg, NOCLinkName.NOC0_EAST_OUT, node, focusedPipeIds);
        drawSelections(svg, NOCLinkName.NOC0_WEST_IN, node, focusedPipeIds);
        drawSelections(svg, NOCLinkName.NOC0_SOUTH_OUT, node, focusedPipeIds);
        drawSelections(svg, NOCLinkName.NOC0_NORTH_IN, node, focusedPipeIds);
        drawSelections(svg, NOCLinkName.NOC0_IN, node, focusedPipeIds);
        drawSelections(svg, NOCLinkName.NOC0_OUT, node, focusedPipeIds);

        drawSelections(svg, NOCLinkName.NOC1_NORTH_OUT, node, focusedPipeIds);
        drawSelections(svg, NOCLinkName.NOC1_SOUTH_IN, node, focusedPipeIds);
        drawSelections(svg, NOCLinkName.NOC1_WEST_OUT, node, focusedPipeIds);
        drawSelections(svg, NOCLinkName.NOC1_EAST_IN, node, focusedPipeIds);
        drawSelections(svg, NOCLinkName.NOC1_IN, node, focusedPipeIds);
        drawSelections(svg, NOCLinkName.NOC1_OUT, node, focusedPipeIds);
    }
    return <svg className='node-focus-svg' ref={svgRef} width={NODE_SIZE} height={NODE_SIZE} />;
};

interface NodePipeRendererProps {
    node: ComputeNode;
    showEmptyLinks: boolean;
    showLinkSaturation: boolean;
    linkSaturationTreshold: number;
}

const NodePipeRenderer: React.FC<NodePipeRendererProps> = ({
    //
    node,
    showEmptyLinks,
    showLinkSaturation,
    linkSaturationTreshold,
    //
}) => {
    // TODO: note to future self this is working incidently, but once gridview starts being generated later or regenerated this will likely need a useEffect
    const isHighContrast = useSelector(getHighContrastState);
    const linksData = useSelector((state: RootState) => state.linkSaturation.links);
    const focusPipe = useSelector((state: RootState) => state.pipeSelection.focusPipe);
    const allPipes = useSelector((state: RootState) => state.pipeSelection.pipes);
    const selectedPipeIds = Object.values(allPipes)
        .filter((pipe: PipeSelection) => pipe.selected)
        .map((pipe: PipeSelection) => pipe.id);

    const svgRef = useRef<SVGSVGElement | null>(null);
    const svg = d3.select(svgRef.current);

    const noc0Saturation = useSelector((state: RootState) => state.linkSaturation.showNOC0);
    const noc1Saturation = useSelector((state: RootState) => state.linkSaturation.showNOC1);

    svg.selectAll('*').remove();
    if (showEmptyLinks) {
        drawLink(svg, NOCLinkName.NOC1_NORTH_OUT);
        drawLink(svg, NOCLinkName.NOC0_NORTH_IN);
        drawLink(svg, NOCLinkName.NOC1_SOUTH_IN);
        drawLink(svg, NOCLinkName.NOC0_SOUTH_OUT);
        drawLink(svg, NOCLinkName.NOC1_EAST_IN);
        drawLink(svg, NOCLinkName.NOC0_EAST_OUT);
        drawLink(svg, NOCLinkName.NOC0_WEST_IN);
        drawLink(svg, NOCLinkName.NOC1_WEST_OUT);
        drawLink(svg, NOCLinkName.NOC1_OUT);
        drawLink(svg, NOCLinkName.NOC0_OUT);
        drawLink(svg, NOCLinkName.NOC0_IN);
        drawLink(svg, NOCLinkName.NOC1_IN);
    }

    if (showLinkSaturation) {
        node.links.forEach((link) => {
            if ((link.noc === NOC.NOC0 && noc0Saturation) || (link.noc === NOC.NOC1 && noc1Saturation)) {
                const linkStateData = linksData[link.uid];
                if (linkStateData.saturation >= linkSaturationTreshold) {
                    const color = calculateLinkCongestionColor(linkStateData.saturation, 0, isHighContrast);
                    drawLink(svg, link.name, color, 5);
                }
            }
        });
    }

    let noc0numPipes = 0;
    let noc1numPipes = 0;
    noc0numPipes += drawSelections(svg, NOCLinkName.NOC0_EAST_OUT, node, selectedPipeIds);
    noc0numPipes += drawSelections(svg, NOCLinkName.NOC0_WEST_IN, node, selectedPipeIds);
    noc0numPipes += drawSelections(svg, NOCLinkName.NOC0_SOUTH_OUT, node, selectedPipeIds);
    noc0numPipes += drawSelections(svg, NOCLinkName.NOC0_NORTH_IN, node, selectedPipeIds);
    noc0numPipes += drawSelections(svg, NOCLinkName.NOC0_IN, node, selectedPipeIds);
    noc0numPipes += drawSelections(svg, NOCLinkName.NOC0_OUT, node, selectedPipeIds);

    noc1numPipes += drawSelections(svg, NOCLinkName.NOC1_NORTH_OUT, node, selectedPipeIds);
    noc1numPipes += drawSelections(svg, NOCLinkName.NOC1_SOUTH_IN, node, selectedPipeIds);
    noc1numPipes += drawSelections(svg, NOCLinkName.NOC1_WEST_OUT, node, selectedPipeIds);
    noc1numPipes += drawSelections(svg, NOCLinkName.NOC1_EAST_IN, node, selectedPipeIds);
    noc1numPipes += drawSelections(svg, NOCLinkName.NOC1_IN, node, selectedPipeIds);
    noc1numPipes += drawSelections(svg, NOCLinkName.NOC1_OUT, node, selectedPipeIds);

    if (noc0numPipes > 0) {
        drawNOCRouter(svg, NOC_CONFIGURATION.noc0);
    }
    if (noc1numPipes > 0) {
        drawNOCRouter(svg, NOC_CONFIGURATION.noc1);
    }
    return (
        <svg
            className={`node-svg ${focusPipe !== null ? 'focus-mode' : ''}`}
            ref={svgRef}
            width={NODE_SIZE}
            height={NODE_SIZE}
        />
    );
};
