import React, {useContext, useEffect, useRef, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import * as d3 from 'd3';
import {Position, Switch} from '@blueprintjs/core';
import {Tooltip2} from '@blueprintjs/popover2';

import DataSource, {SVGContext} from '../data/DataSource';
import {ComputeNode, LinkDirection, LinkDirectionInternal} from '../data/DataStructures';
import getPipeColor, {getGroupColor} from '../data/ColorGenerator';
import {drawArrow, NODE_SIZE, NODE_GAP, SVG_MARGIN, ROUTER_SIZE, getLinkDrawing} from '../utils/DrawingAPI';
import {RootState, selectNodeSelectionById, updateNodeSelection} from '../data/store';

export default function GridRender() {
    const {svgData} = useContext<SVGContext>(DataSource);
    const [showEmptyLinks, setShowEmptyLinks] = useState(false);
    const [showOperationColors, setShowOperationColors] = useState(false);
    const [showNodeLocation, setShowNodeLocation] = useState(false);

    return (
        <>
            <div className="inner-sidebar">
                <Tooltip2 content="Show all links overlay" position={Position.RIGHT}>
                    <Switch checked={showEmptyLinks} label="links" onChange={(event) => setShowEmptyLinks(event.currentTarget.checked)} />
                </Tooltip2>
                <Tooltip2 content="Show all operations colors" position={Position.RIGHT}>
                    <Switch checked={showOperationColors} label="ops" onChange={(event) => setShowOperationColors(event.currentTarget.checked)} />
                </Tooltip2>
                <Tooltip2 content="Show Compute Node locations" position={Position.RIGHT}>
                    <Switch checked={showNodeLocation} label="location" onChange={(event) => setShowNodeLocation(event.currentTarget.checked)} />
                </Tooltip2>
            </div>
            <div className="grid-container">
                <div className="node-container" style={{gridTemplateColumns: `repeat(${svgData.totalCols + 1}, ${NODE_SIZE}px)`}}>
                    {svgData.nodes.map((node, index) => {
                        return (
                            <NodeComponent node={node} showEmptyLinks={showEmptyLinks} showNodeLocation={showNodeLocation} showOperationColors={showOperationColors} key={index} />
                        );
                    })}
                </div>
            </div>
        </>
    );
}

interface NodeComponentProps {
    node: ComputeNode;
    showEmptyLinks: boolean;
    showOperationColors: boolean;
    showNodeLocation: boolean;
}

const NodeComponent: React.FC<NodeComponentProps> = ({node, showEmptyLinks, showOperationColors, showNodeLocation}) => {
    const svgRef = useRef<SVGSVGElement | null>(null);
    const allPipes = useSelector((state: RootState) => state.pipeSelection.pipes);
    const dispatch = useDispatch();
    const nodeState = useSelector((state: RootState) => selectNodeSelectionById(state, node.uid));
    const selectedPipeIds = Object.values(allPipes)
        .filter((pipe) => pipe.selected)
        .map((pipe) => pipe.id);

    useEffect(() => {
        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();
        if (showEmptyLinks) {
            drawArrow(svg, LinkDirectionInternal.LINK_IN);
            drawArrow(svg, LinkDirectionInternal.LINK_OUT);
            drawArrow(svg, LinkDirection.NORTH_OUT);
            drawArrow(svg, LinkDirection.NORTH_IN);
            drawArrow(svg, LinkDirection.SOUTH_IN);
            drawArrow(svg, LinkDirection.SOUTH_OUT);
            drawArrow(svg, LinkDirection.EAST_IN);
            drawArrow(svg, LinkDirection.EAST_OUT);
            drawArrow(svg, LinkDirection.WEST_IN);
            drawArrow(svg, LinkDirection.WEST_OUT);
        }

        const drawSelections = (link: d3.Selection<SVGSVGElement | null, unknown, null, undefined>, direction: LinkDirection | LinkDirectionInternal) => {
            const {lineEndX, lineEndY, lineStartX, lineStartY, arr1, arr2, arr3, transform} = getLinkDrawing(direction);
            const nodePipeIds = node.getPipesForDirection(direction);
            const pipeIds = nodePipeIds.filter((pipeId) => selectedPipeIds.includes(pipeId));

            // console.log(selectedPipes);

            const strokeLength = 5;
            if (pipeIds.length) {
                if (direction !== LinkDirection.SOUTH_IN && direction !== LinkDirection.WEST_IN && direction !== LinkDirection.SOUTH_OUT && direction !== LinkDirection.WEST_OUT) {
                    link.append('polygon').attr('points', `${arr1} ${arr2} ${arr3}`).attr('transform', transform).attr('fill', '#9e9e9e');
                }
            }
            const dashArray = [strokeLength, (pipeIds.length - 1) * strokeLength];
            pipeIds.forEach((pipeId: string, index: number) => {
                link.append('line')
                    .attr('class', `arrow-${direction}`)
                    .attr('x1', lineStartX)
                    .attr('y1', lineStartY)
                    .attr('x2', lineEndX)
                    .attr('y2', lineEndY)
                    .attr('stroke-width', 2)
                    .attr('stroke', getPipeColor(pipeId))
                    .attr('stroke-dasharray', dashArray.join(','))
                    .attr('stroke-dashoffset', index * dashArray[0]);
            });

            return pipeIds.length;
        };

        let selectedPipesNum = 0;
        selectedPipesNum += drawSelections(svg, LinkDirection.EAST_OUT);
        selectedPipesNum += drawSelections(svg, LinkDirection.WEST_IN);
        selectedPipesNum += drawSelections(svg, LinkDirection.NORTH_OUT);
        selectedPipesNum += drawSelections(svg, LinkDirection.SOUTH_IN);
        selectedPipesNum += drawSelections(svg, LinkDirection.SOUTH_OUT);
        selectedPipesNum += drawSelections(svg, LinkDirection.WEST_OUT);
        selectedPipesNum += drawSelections(svg, LinkDirection.NORTH_IN);
        selectedPipesNum += drawSelections(svg, LinkDirection.EAST_IN);
        selectedPipesNum += drawSelections(svg, LinkDirectionInternal.LINK_IN);
        selectedPipesNum += drawSelections(svg, LinkDirectionInternal.LINK_OUT);



        if (selectedPipesNum > 0) {

            //TODO: we will render two nocs instead

            // link.append('circle')
            //     .attr('cx', 20)
            //     .attr('cy', NODE_SIZE - 20)
            //     .attr('r', ROUTER_SIZE / 2)
            //     .attr('fill', 'none')
            //     .attr('stroke', '#939393')
            //     .attr('stroke-width', 3)
            //     .style('pointer-events', 'none');
        }

        //
    }, [showEmptyLinks, svgRef, selectedPipeIds]);
    const triggerSelection = () => {
        console.log('trigger selection', node.uid);
        dispatch(updateNodeSelection({id: node.uid, selected: !nodeState.selected}));
    };

    const borderColorStyles = nodeState.selected ? {borderColor: getGroupColor(node.opName)} : {};
    return (
        <div className={`node-item  ${nodeState.selected ? 'selected' : ''}`} style={borderColorStyles} onClick={triggerSelection}>
            <div className={`node-type-label node-type-${node.getNodeLabel()}`}>{node.getNodeLabel()}</div>
            <svg className="node-svg" ref={svgRef} width={NODE_SIZE} height={NODE_SIZE} />
            {node.opName !== '' && showOperationColors && <div className="op-color-swatch" style={{backgroundColor: getGroupColor(node.opName)}} />}
            {showNodeLocation && (
                <div className="n" style={{position: 'absolute', top: 0, left: '20px'}}>
                    {node.loc.x},{node.loc.y}
                </div>
            )}
        </div>
    );
};
