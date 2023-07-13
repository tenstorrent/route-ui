import React, {useEffect, useRef} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import * as d3 from 'd3';
import {getGroup, PipeSelection, RootState, selectNodeSelectionById, updateNodeSelection} from '../data/store';
import {ComputeNode, LinkDirection} from '../data/DataStructures';
import {calculateIntensity, drawLink, drawNOC, drawSelections, NOC_CONFIGURATION, NODE_SIZE} from '../utils/DrawingAPI';
import {getGroupColor} from '../data/ColorGenerator';

interface NodeComponentProps {
    node: ComputeNode;
    showEmptyLinks: boolean;
    showOperationColors: boolean;
    showNodeLocation: boolean;
    showLinkSaturation: boolean;
    linkSaturationTreshold: number;
}

const NodeComponent: React.FC<NodeComponentProps> = ({
    node,
    showEmptyLinks,
    showOperationColors,
    showNodeLocation,
    showLinkSaturation,
    linkSaturationTreshold,
    //
}) => {
    const svgRef = useRef<SVGSVGElement | null>(null);
    const allPipes = useSelector((state: RootState) => state.pipeSelection.pipes);
    const dispatch = useDispatch();
    const nodeState = useSelector((state: RootState) => selectNodeSelectionById(state, node.uid));
    const selectedPipeIds = Object.values(allPipes)
        .filter((pipe: PipeSelection) => pipe.selected)
        .map((pipe: PipeSelection) => pipe.id);

    const selectedGroup = useSelector((state: RootState) => getGroup(state, node.opName));

    useEffect(() => {
        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();
        if (showEmptyLinks) {
            drawLink(svg, LinkDirection.NOC1_NORTH_OUT);
            drawLink(svg, LinkDirection.NOC0_NORTH_IN);
            drawLink(svg, LinkDirection.NOC1_SOUTH_IN);
            drawLink(svg, LinkDirection.NOC0_SOUTH_OUT);
            drawLink(svg, LinkDirection.NOC1_EAST_IN);
            drawLink(svg, LinkDirection.NOC0_EAST_OUT);
            drawLink(svg, LinkDirection.NOC0_WEST_IN);
            drawLink(svg, LinkDirection.NOC1_WEST_OUT);
            drawLink(svg, LinkDirection.NOC1_OUT);
            drawLink(svg, LinkDirection.NOC0_OUT);
            drawLink(svg, LinkDirection.NOC0_IN);
            drawLink(svg, LinkDirection.NOC1_IN);
        }

        if (showLinkSaturation) {
            node.links.forEach((link) => {
                if (link.linkSaturation >= linkSaturationTreshold) {
                    drawLink(svg, link.direction, calculateIntensity(link.linkSaturation, linkSaturationTreshold), 5);
                }
            });
        }

        let noc0numPipes = 0;
        let noc1numPipes = 0;
        noc0numPipes += drawSelections(svg, LinkDirection.NOC0_EAST_OUT, node, selectedPipeIds);
        noc0numPipes += drawSelections(svg, LinkDirection.NOC0_WEST_IN, node, selectedPipeIds);
        noc0numPipes += drawSelections(svg, LinkDirection.NOC0_SOUTH_OUT, node, selectedPipeIds);
        noc0numPipes += drawSelections(svg, LinkDirection.NOC0_NORTH_IN, node, selectedPipeIds);
        noc0numPipes += drawSelections(svg, LinkDirection.NOC0_IN, node, selectedPipeIds);
        noc0numPipes += drawSelections(svg, LinkDirection.NOC0_OUT, node, selectedPipeIds);

        noc1numPipes += drawSelections(svg, LinkDirection.NOC1_NORTH_OUT, node, selectedPipeIds);
        noc1numPipes += drawSelections(svg, LinkDirection.NOC1_SOUTH_IN, node, selectedPipeIds);
        noc1numPipes += drawSelections(svg, LinkDirection.NOC1_WEST_OUT, node, selectedPipeIds);
        noc1numPipes += drawSelections(svg, LinkDirection.NOC1_EAST_IN, node, selectedPipeIds);
        noc1numPipes += drawSelections(svg, LinkDirection.NOC1_IN, node, selectedPipeIds);
        noc1numPipes += drawSelections(svg, LinkDirection.NOC1_OUT, node, selectedPipeIds);

        if (noc0numPipes > 0) {
            drawNOC(svg, NOC_CONFIGURATION.noc0);
        }
        if (noc1numPipes > 0) {
            drawNOC(svg, NOC_CONFIGURATION.noc1);
        }

        //
    }, [svgRef, selectedPipeIds]);
    const triggerSelection = () => {
        dispatch(updateNodeSelection({id: node.uid, selected: !nodeState.selected}));
    };

    let operationStyles = {};
    if (node.opName !== '' && selectedGroup.selected) {
        const color = getGroupColor(node.opName);
        operationStyles = {borderColor: getGroupColor(node.opName)};
        const border = selectedGroup.data.filter((n) => n.id === node.uid)[0]?.border;
        const borderSize = 2;
        if (border.left) {
            operationStyles = {...operationStyles, borderLeft: `${borderSize}px solid ${color}`};
        }
        if (border.right) {
            operationStyles = {...operationStyles, borderRight: `${borderSize}px solid ${color}`};
        }
        if (border.top) {
            operationStyles = {...operationStyles, borderTop: `${borderSize}px solid ${color}`};
        }
        if (border.bottom) {
            operationStyles = {...operationStyles, borderBottom: `${borderSize}px solid ${color}`};
        }

        const gradientColor = color?.replace(')', ', 0.25)').replace('rgb', 'rgba');
        const gradient = `repeating-linear-gradient(-45deg, ${gradientColor}, ${gradientColor} 3px, transparent 3px, transparent 6px)`;
        operationStyles = {...operationStyles, background: gradient};
    } else {
        operationStyles = {};
    }

    // const borderColorStyles = nodeState.selected ? {borderColor: getGroupColor(node.opName)} : {};

    return (
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events
        <div className={`node-item  ${nodeState.selected ? 'selected' : ''}`} onClick={triggerSelection}>
            <div className="group-border" style={operationStyles} />
            <div className="node-border" />
            {node.opName !== '' && showOperationColors && <div className="op-color-swatch" style={{backgroundColor: getGroupColor(node.opName)}} />}
            {showNodeLocation && (
                <div className="node-location">
                    {node.loc.x},{node.loc.y}
                </div>
            )}
            <svg className="node-svg" ref={svgRef} width={NODE_SIZE} height={NODE_SIZE} />
            <div className={`node-type-label node-type-${node.getNodeLabel()}`}>{node.getNodeLabel()}</div>
        </div>
    );
};
export default NodeComponent;
