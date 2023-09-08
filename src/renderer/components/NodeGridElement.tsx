import React, {useRef} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import * as d3 from 'd3';
import {
    getCoreHighlight,
    getDramGroup,
    getFocusModeState,
    getGroup,
    HighlightType,
    openDetailedView,
    PipeSelection,
    RootState,
    selectNodeSelectionById,
    updateNodeSelection,
} from '../../data/store';
import {ComputeNodeData, LinkName} from '../../data/DataStructures';
import {calculateLinkCongestionColor, drawLink, drawNOC, drawSelections, getDramGroupingStyles, getNodeOpStyles, NOC_CONFIGURATION, NODE_SIZE} from '../../utils/DrawingAPI';
import {getGroupColor} from '../../data/ColorGenerator';

interface NodeGridElementProps {
    node: ComputeNodeData;
    showEmptyLinks: boolean;
    showOperationColors: boolean;
    showNodeLocation: boolean;
    showLinkSaturation: boolean;
    linkSaturationTreshold: number;
}

const NodeGridElement: React.FC<NodeGridElementProps> = ({
    //
    node,
    showEmptyLinks,
    showOperationColors,
    showNodeLocation,
    showLinkSaturation,
    linkSaturationTreshold,
    //
}) => {
    // TODO: move the below to separate components

    const svgRef = useRef<SVGSVGElement | null>(null);
    const svgFocusRef = useRef<SVGSVGElement | null>(null);
    const dispatch = useDispatch();
    const nodeState = useSelector((state: RootState) => selectNodeSelectionById(state, node.uid));
    const coreHighlight = useSelector((state: RootState) => getCoreHighlight(state, node.uid));
    const allPipes = useSelector((state: RootState) => state.pipeSelection.pipes);
    const selectedPipeIds = Object.values(allPipes)
        .filter((pipe: PipeSelection) => pipe.selected)
        .map((pipe: PipeSelection) => pipe.id);

    const focusedPipes = useSelector((state: RootState) => state.pipeSelection.focusPipes);
    const focusedPipeIds = Object.values(focusedPipes)
        .filter((pipe: PipeSelection) => pipe.selected)
        .map((pipe: PipeSelection) => pipe.id);

    const selectedGroup = useSelector((state: RootState) => getGroup(state, node.opName));
    const {isOpen, uid} = useSelector((state: RootState) => state.detailedView);
    const dramAllocation = useSelector((state: RootState) => getDramGroup(state, node.dramChannel));
    const isHighContrast = useSelector((state: RootState) => state.highContrast.enabled);
    const linksData = useSelector((state: RootState) => state.linkSaturation.links);

    const operandsIn: {op: string; selected: boolean}[] = useSelector((state: RootState) => state.nodeSelection.ioGroupsIn[node.uid] || []);
    const operandsOut: {op: string; selected: boolean}[] = useSelector((state: RootState) => state.nodeSelection.ioGroupsOut[node.uid] || []);

    const focusMode = useSelector((state: RootState) => getFocusModeState(state));

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const svgFocus = d3.select(svgFocusRef.current);
    svgFocus.selectAll('*').remove();

    if (showEmptyLinks) {
        drawLink(svg, LinkName.NOC1_NORTH_OUT);
        drawLink(svg, LinkName.NOC0_NORTH_IN);
        drawLink(svg, LinkName.NOC1_SOUTH_IN);
        drawLink(svg, LinkName.NOC0_SOUTH_OUT);
        drawLink(svg, LinkName.NOC1_EAST_IN);
        drawLink(svg, LinkName.NOC0_EAST_OUT);
        drawLink(svg, LinkName.NOC0_WEST_IN);
        drawLink(svg, LinkName.NOC1_WEST_OUT);
        drawLink(svg, LinkName.NOC1_OUT);
        drawLink(svg, LinkName.NOC0_OUT);
        drawLink(svg, LinkName.NOC0_IN);
        drawLink(svg, LinkName.NOC1_IN);
    }

    if (showLinkSaturation) {
        node.links.forEach((link) => {
            const linkData = linksData[link.uid];
            if (linkData.saturation >= linkSaturationTreshold) {
                const color = calculateLinkCongestionColor(linkData.saturation, 0, isHighContrast);
                drawLink(svg, link.name, color, 5);
            }
        });
    }

    let noc0numPipes = 0;
    let noc1numPipes = 0;
    noc0numPipes += drawSelections(svg, LinkName.NOC0_EAST_OUT, node, selectedPipeIds);
    noc0numPipes += drawSelections(svg, LinkName.NOC0_WEST_IN, node, selectedPipeIds);
    noc0numPipes += drawSelections(svg, LinkName.NOC0_SOUTH_OUT, node, selectedPipeIds);
    noc0numPipes += drawSelections(svg, LinkName.NOC0_NORTH_IN, node, selectedPipeIds);
    noc0numPipes += drawSelections(svg, LinkName.NOC0_IN, node, selectedPipeIds);
    noc0numPipes += drawSelections(svg, LinkName.NOC0_OUT, node, selectedPipeIds);

    noc1numPipes += drawSelections(svg, LinkName.NOC1_NORTH_OUT, node, selectedPipeIds);
    noc1numPipes += drawSelections(svg, LinkName.NOC1_SOUTH_IN, node, selectedPipeIds);
    noc1numPipes += drawSelections(svg, LinkName.NOC1_WEST_OUT, node, selectedPipeIds);
    noc1numPipes += drawSelections(svg, LinkName.NOC1_EAST_IN, node, selectedPipeIds);
    noc1numPipes += drawSelections(svg, LinkName.NOC1_IN, node, selectedPipeIds);
    noc1numPipes += drawSelections(svg, LinkName.NOC1_OUT, node, selectedPipeIds);

    if (noc0numPipes > 0) {
        drawNOC(svg, NOC_CONFIGURATION.noc0);
    }
    if (noc1numPipes > 0) {
        drawNOC(svg, NOC_CONFIGURATION.noc1);
    }

    if (focusMode && focusedPipeIds.length) {
        drawSelections(svgFocus, LinkName.NOC0_EAST_OUT, node, focusedPipeIds);
        drawSelections(svgFocus, LinkName.NOC0_WEST_IN, node, focusedPipeIds);
        drawSelections(svgFocus, LinkName.NOC0_SOUTH_OUT, node, focusedPipeIds);
        drawSelections(svgFocus, LinkName.NOC0_NORTH_IN, node, focusedPipeIds);
        drawSelections(svgFocus, LinkName.NOC0_IN, node, focusedPipeIds);
        drawSelections(svgFocus, LinkName.NOC0_OUT, node, focusedPipeIds);

        drawSelections(svgFocus, LinkName.NOC1_NORTH_OUT, node, focusedPipeIds);
        drawSelections(svgFocus, LinkName.NOC1_SOUTH_IN, node, focusedPipeIds);
        drawSelections(svgFocus, LinkName.NOC1_WEST_OUT, node, focusedPipeIds);
        drawSelections(svgFocus, LinkName.NOC1_EAST_IN, node, focusedPipeIds);
        drawSelections(svgFocus, LinkName.NOC1_IN, node, focusedPipeIds);
        drawSelections(svgFocus, LinkName.NOC1_OUT, node, focusedPipeIds);
    }

    const triggerSelection = () => {
        const selectedState = nodeState.selected;
        if (isOpen && selectedState) {
            dispatch(openDetailedView(node.uid));
        } else {
            dispatch(updateNodeSelection({id: node.uid, selected: !nodeState.selected}));
        }
    };

    let operationStyles = {};
    if (node.opName !== '' && selectedGroup.selected) {
        const color = getGroupColor(node.opName);
        operationStyles = {borderColor: getGroupColor(node.opName)};
        const border = selectedGroup.data.filter((n) => n.id === node.uid)[0]?.border;
        operationStyles = getNodeOpStyles(operationStyles, color, border);
    }
    let dramStyles = {};
    if (node.dramChannel > -1 && dramAllocation && dramAllocation.selected && dramAllocation.data.length > 1) {
        const border = dramAllocation.data.filter((n) => n.id === node.uid)[0]?.border;
        dramStyles = getDramGroupingStyles(border);
    }

    // console.log(coreHighlight);

    const highlightClass = coreHighlight === HighlightType.NONE ? '' : `core-highlight-${coreHighlight}`;

    return (
        <button
            type="button"
            className={`node-item ${highlightClass} ${nodeState.selected ? 'selected' : ''} ${node.uid === uid && isOpen ? 'detailed-view' : ''}`}
            onClick={triggerSelection}
        >
            <div className="group-border" style={operationStyles} />
            <div className="operand-wrap">
                {operandsIn
                    .filter((operand) => operand.selected)
                    .map((operand) => {
                        const styles = {backgroundColor: getGroupColor(operand.op)};
                        return <div className="operand in" style={styles} />;
                    })}
                {operandsOut
                    .filter((operand) => operand.selected)
                    .map((operand) => {
                        const styles = {backgroundColor: getGroupColor(operand.op)};
                        return <div className="operand out" style={styles} />;
                    })}
            </div>
            <div className="dram-border" style={dramStyles} />
            <div className="node-border" />
            <div className="core-highlight" />
            {node.opName !== '' && showOperationColors && <div className="op-color-swatch" style={{backgroundColor: getGroupColor(node.opName)}} />}
            {showNodeLocation && (
                <div className="node-location">
                    {node.loc.x},{node.loc.y}
                </div>
            )}
            <svg className="node-focus-svg" ref={svgFocusRef} width={NODE_SIZE} height={NODE_SIZE} />
            <svg className={`node-svg ${focusMode ? 'focus-mode' : ''}`} ref={svgRef} width={NODE_SIZE} height={NODE_SIZE} />
            <div className={`node-type-label node-type-${node.getNodeLabel()}`}>{node.getNodeLabel()}</div>
        </button>
    );
};

export default NodeGridElement;
