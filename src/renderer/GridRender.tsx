import React, {useContext, useEffect, useRef, useState} from 'react';
import * as d3 from 'd3';
import {zoom} from 'd3';
import {Position, Switch} from '@blueprintjs/core';
import {Tooltip2} from '@blueprintjs/popover2';
import DataSource, {SVGContext} from '../data/DataSource';
import SVGData, {ComputeNode, LinkDirection, LinkDirectionInternal, Pipe} from '../data/DataStructures';
import getPipeColor from '../data/ColorGenerator';

export default function GridRender() {
    const {svgData, setSvgData} = useContext<SVGContext>(DataSource);
    const svgRef = useRef<SVGSVGElement | null>(null);
    const [gridWidth, setGridWidth] = useState(0);
    const [gridHeight, setGridHeight] = useState(0);
    const [showEmptyLinks, setShowEmptyLinks] = useState(false);

    useEffect(() => {
        const permSt = performance.now();

        const SVG_MARGIN = 0;
        const NODE_GAP = 1;
        const NODE_SIZE = 80;
        const ROUTER_SIZE = 20;

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const zoomBehavior = zoom().on('zoom', (event) => {
            const {transform} = event;
            svg.attr('transform', transform);
        });

        // zoom functionality may or may not be needed
        // svg = svg.call(zoomBehavior).call(zoomBehavior.transform, d3.zoomIdentity);
        // zoomBehavior.translateExtent([[-this.props.width, -this.props.height], [2*this.props.width, 2*this.props.height]]);
        zoomBehavior.scaleExtent([1, 4]);

        const nodeData: ComputeNode[] = svgData.nodes;

        setGridWidth((svgData.totalCols + 1) * (NODE_SIZE + NODE_GAP) + SVG_MARGIN * 2);
        setGridHeight((svgData.totalRows + 1) * (NODE_SIZE + NODE_GAP) + SVG_MARGIN * 2);

        const nodes = svg
            .selectAll('g')
            .data(nodeData)
            .enter()
            .append('g')
            // .attr('fill', '#d7d7d7')
            .attr('fill', (d) => {
                return d.selected ? '#777777' : '#676767';
            })
            .attr('fill-opacity', '1')
            .attr('transform', (d: ComputeNode) => {
                return `translate(${d.loc.x * (NODE_SIZE + NODE_GAP) + SVG_MARGIN},${d.loc.y * (NODE_SIZE + NODE_GAP) + SVG_MARGIN})`;
            });

        nodes
            .append('rect')
            .attr('class', 'node')
            .attr('width', NODE_SIZE)
            .attr('height', NODE_SIZE)
            .attr('stroke', (d) => {
                return d.selected ? '#e253e7' : 'none';
            })
            .attr('stroke-width', 2);

        // .attr('stroke', 'steelblue');

        nodes
            .append('rect')
            .attr('class', (d) => `node-type-${d.getType()}`)
            .attr('x', NODE_SIZE - 20)
            .attr('y', 5)
            .attr('fill', 'none')
            .attr('stroke', 'none')
            .attr('width', 15)
            .attr('height', 15)
            .style('pointer-events', 'none');

        nodes
            .append('text')
            .attr('x', NODE_SIZE - 20 + 7.5)
            .attr('y', 5)
            .attr('width', 15)
            .text((d) => d.getType())
            .attr('text-anchor', 'middle')
            .attr('alignment-baseline', 'hanging')
            .attr('fill', '#000000')
            .style('pointer-events', 'none');

        // router - might still need this
        const links = nodes.append('g').attr('class', 'links');

        const getLinkDrawing = (direction: LinkDirection | LinkDirectionInternal) => {
            const STARTING_POINT = 20; // offset from the edge
            const LINE_OFFSET = 25; // (for router)
            const INTERNAL_LINK_ENDPOINT = 22; // (for internal links)
            const INTERNAL_LINK_START = 6; // (for internal links)
            const INTERNAL_LINK_OFFSET = 3; // (for internal links)

            let lineStartX = STARTING_POINT;
            let lineEndX = STARTING_POINT;
            let lineStartY = 0;

            let lineEndY = NODE_SIZE;

            const arrowHeadHeight = 9;
            const arrowHeadWidth = 9;

            let arrowOffset = 0;
            let transform = '';
            let angle = 0;

            let arr1;
            let arr2;
            let arr3;

            const xOff = 4;
            const yOff = 4;

            switch (direction) {
                case LinkDirection.NORTH_OUT:
                    // up out
                    arrowOffset = 5;
                    lineStartX += xOff;
                    lineEndX += xOff;

                    lineEndY -= LINE_OFFSET;

                    arr1 = `${lineEndX - arrowHeadWidth / 2},${lineStartY + arrowHeadHeight + arrowOffset}`;
                    arr2 = `${lineEndX + arrowHeadWidth / 2},${lineStartY + arrowHeadHeight + arrowOffset}`;
                    arr3 = `${lineEndX},${lineStartY + arrowOffset}`;
                    break;
                case LinkDirection.SOUTH_IN:
                    // up in
                    arrowOffset = 3;
                    lineStartX += xOff;
                    lineEndX += xOff;

                    lineStartY = NODE_SIZE - LINE_OFFSET + ROUTER_SIZE / 2;
                    lineEndY = NODE_SIZE;
                    // lineEndY -= STARTING_POINT;

                    arr1 = `0,0`;
                    arr2 = `0,0`;
                    arr3 = `0,0`;

                    arr1 = `${lineEndX - arrowHeadWidth / 2},${lineStartY + arrowHeadHeight + arrowOffset}`;
                    arr2 = `${lineEndX + arrowHeadWidth / 2},${lineStartY + arrowHeadHeight + arrowOffset}`;
                    arr3 = `${lineEndX},${lineStartY + arrowOffset}`;

                    break;
                case LinkDirection.NORTH_IN:
                    // down in

                    arrowOffset = 20;
                    lineStartX -= xOff;
                    lineEndX -= xOff;
                    lineEndY -= LINE_OFFSET;
                    arr1 = `${lineEndX - arrowHeadWidth / 2},${lineEndY - arrowHeadHeight - arrowOffset}`;
                    arr2 = `${lineEndX + arrowHeadWidth / 2},${lineEndY - arrowHeadHeight - arrowOffset}`;
                    arr3 = `${lineEndX},${lineEndY - arrowOffset}`;

                    break;
                case LinkDirection.SOUTH_OUT:
                    // down out

                    arrowOffset = 0;
                    lineStartX -= xOff;
                    lineEndX -= xOff;
                    lineStartY = NODE_SIZE - LINE_OFFSET + ROUTER_SIZE / 2;
                    lineEndY = NODE_SIZE;
                    arr1 = `${lineEndX - arrowHeadWidth / 2},${lineEndY - arrowHeadHeight - arrowOffset}`;
                    arr2 = `${lineEndX + arrowHeadWidth / 2},${lineEndY - arrowHeadHeight - arrowOffset}`;
                    arr3 = `${lineEndX},${lineEndY - arrowOffset}`;

                    break;
                case LinkDirection.EAST_IN:
                    // left in

                    arrowOffset = 20;
                    lineStartX = 0;
                    lineEndX = NODE_SIZE;
                    lineStartY = NODE_SIZE - STARTING_POINT + yOff;
                    lineEndY = NODE_SIZE - STARTING_POINT + yOff;
                    lineStartX += LINE_OFFSET;
                    arr1 = `${lineStartX + arrowHeadHeight + arrowOffset},${lineEndY - arrowHeadWidth / 2}`;
                    arr2 = `${lineStartX + arrowHeadHeight + arrowOffset},${lineEndY + arrowHeadWidth / 2}`;
                    arr3 = `${lineStartX + arrowOffset},${lineEndY}`;

                    break;
                case LinkDirection.WEST_OUT:
                    // left out
                    arrowOffset = 0;
                    lineStartX = 0;
                    lineEndX = LINE_OFFSET - ROUTER_SIZE / 2;
                    lineStartY = NODE_SIZE - STARTING_POINT + yOff;
                    lineEndY = NODE_SIZE - STARTING_POINT + yOff;
                    // lineStartX += LINE_OFFSET;
                    arr1 = `${lineStartX + arrowHeadHeight + arrowOffset},${lineEndY - arrowHeadWidth / 2}`;
                    arr2 = `${lineStartX + arrowHeadHeight + arrowOffset},${lineEndY + arrowHeadWidth / 2}`;
                    arr3 = `${lineStartX + arrowOffset},${lineEndY}`;

                    break;
                case LinkDirection.EAST_OUT:
                    // right out
                    arrowOffset = 5;
                    lineStartX = 0;
                    lineEndX = NODE_SIZE;
                    lineStartY = NODE_SIZE - STARTING_POINT - yOff;
                    lineEndY = NODE_SIZE - STARTING_POINT - yOff;
                    lineStartX += LINE_OFFSET;
                    arr1 = `${lineEndX - arrowHeadHeight - arrowOffset},${lineEndY - arrowHeadWidth / 2}`;
                    arr2 = `${lineEndX - arrowHeadHeight - arrowOffset},${lineEndY + arrowHeadWidth / 2}`;
                    arr3 = `${lineEndX - arrowOffset},${lineEndY}`;
                    break;
                case LinkDirection.WEST_IN:
                    // right in
                    arrowOffset = 5;
                    lineStartX = 0;
                    lineEndX = LINE_OFFSET - ROUTER_SIZE / 2;
                    lineStartY = NODE_SIZE - STARTING_POINT - yOff;
                    lineEndY = NODE_SIZE - STARTING_POINT - yOff;
                    arr1 = `${lineEndX - arrowHeadHeight - arrowOffset},${lineEndY - arrowHeadWidth / 2}`;
                    arr2 = `${lineEndX - arrowHeadHeight - arrowOffset},${lineEndY + arrowHeadWidth / 2}`;
                    arr3 = `${lineEndX - arrowOffset},${lineEndY}`;
                    break;
                case LinkDirectionInternal.LINK_IN:
                    arrowOffset = -10;
                    lineStartX = NODE_SIZE - INTERNAL_LINK_ENDPOINT - INTERNAL_LINK_OFFSET;
                    lineStartY = INTERNAL_LINK_ENDPOINT - INTERNAL_LINK_OFFSET;
                    lineEndX = STARTING_POINT + xOff - INTERNAL_LINK_OFFSET + INTERNAL_LINK_START;
                    lineEndY = NODE_SIZE - LINE_OFFSET - INTERNAL_LINK_OFFSET - INTERNAL_LINK_START;

                    arr1 = `${lineEndX - arrowHeadWidth / 2},${lineStartY + arrowHeadHeight + arrowOffset}`;
                    arr2 = `${lineEndX + arrowHeadWidth / 2},${lineStartY + arrowHeadHeight + arrowOffset}`;
                    arr3 = `${lineEndX},${lineStartY + arrowOffset}`;
                    angle = (Math.atan2(lineEndY - lineStartY, lineEndX - lineStartX) * 180) / Math.PI - 90;

                    transform = `rotate(${angle} ${lineEndX} ${lineEndY})`;
                    break;
                case LinkDirectionInternal.LINK_OUT:
                    arrowOffset = -55;
                    lineEndX = NODE_SIZE - INTERNAL_LINK_ENDPOINT + INTERNAL_LINK_OFFSET;
                    lineEndY = INTERNAL_LINK_ENDPOINT + INTERNAL_LINK_OFFSET;
                    lineStartX = STARTING_POINT + xOff + INTERNAL_LINK_OFFSET + INTERNAL_LINK_START;
                    lineStartY = NODE_SIZE - LINE_OFFSET + INTERNAL_LINK_OFFSET - INTERNAL_LINK_START;
                    arr1 = `${lineEndX - arrowHeadWidth / 2},${lineStartY + arrowHeadHeight + arrowOffset}`;
                    arr2 = `${lineEndX + arrowHeadWidth / 2},${lineStartY + arrowHeadHeight + arrowOffset}`;
                    arr3 = `${lineEndX},${lineStartY + arrowOffset}`;
                    angle = (Math.atan2(lineEndY - lineStartY, lineEndX - lineStartX) * 180) / Math.PI - 90;

                    transform = `rotate(${angle} ${lineEndX} ${lineEndY})`;
                    break;
                default:
                    lineStartX = 0;
                    lineStartY = 0;
                    lineEndX = 0;
                    lineEndY = 0;
                    console.warn(`Invalid direction ${direction}`);
            }
            return {lineEndX, lineEndY, lineStartX, lineStartY, arr1, arr2, arr3, transform};
        };

        const drawArrow = (selector: d3.Selection<SVGGElement, ComputeNode, d3.BaseType, unknown>, direction: LinkDirection | LinkDirectionInternal) => {
            const {lineEndX, lineEndY, lineStartX, lineStartY, arr1, arr2, arr3, transform} = getLinkDrawing(direction);

            // Draw line
            selector
                .append('line')
                .attr('class', `arrow-${direction}`)
                .attr('x1', lineStartX)
                .attr('y1', lineStartY)
                .attr('x2', lineEndX)
                .attr('y2', lineEndY)
                .attr('stroke-width', 2)
                // .attr('stroke', '#6e6e6e');
                .attr('stroke', '#7e7e7e');
            // arrowhead
            selector.append('polygon').attr('points', `${arr1} ${arr2} ${arr3}`).attr('transform', transform).attr('fill', '#7e7e7e');
        };

        // WILL MAKE THIS TOGGLABLE
        if (showEmptyLinks) {
            drawArrow(links, LinkDirectionInternal.LINK_IN);
            drawArrow(links, LinkDirectionInternal.LINK_OUT);
            drawArrow(links, LinkDirection.NORTH_OUT);
            drawArrow(links, LinkDirection.NORTH_IN);
            drawArrow(links, LinkDirection.SOUTH_IN);
            drawArrow(links, LinkDirection.SOUTH_OUT);
            drawArrow(links, LinkDirection.EAST_IN);
            drawArrow(links, LinkDirection.EAST_OUT);
            drawArrow(links, LinkDirection.WEST_IN);
            drawArrow(links, LinkDirection.WEST_OUT);
        }

        const drawSelections = (
            node: ComputeNode,
            link: d3.Selection<SVGGElement, ComputeNode, SVGSVGElement | null, unknown>,
            direction: LinkDirection | LinkDirectionInternal
        ) => {
            const {lineEndX, lineEndY, lineStartX, lineStartY, arr1, arr2, arr3, transform} = getLinkDrawing(direction);
            const pipeIds = node.getSelections(direction);
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

        nodeData.forEach((node, nodeIndex) => {
            const link = nodes
                .filter((d, i) => i === nodeIndex)
                .append('g')
                .attr('class', 'links-new');

            let selectedPipesNum = 0;
            selectedPipesNum += drawSelections(node, link, LinkDirection.EAST_OUT);
            selectedPipesNum += drawSelections(node, link, LinkDirection.WEST_IN);
            selectedPipesNum += drawSelections(node, link, LinkDirection.NORTH_OUT);
            selectedPipesNum += drawSelections(node, link, LinkDirection.SOUTH_IN);
            selectedPipesNum += drawSelections(node, link, LinkDirection.SOUTH_OUT);
            selectedPipesNum += drawSelections(node, link, LinkDirection.WEST_OUT);
            selectedPipesNum += drawSelections(node, link, LinkDirection.NORTH_IN);
            selectedPipesNum += drawSelections(node, link, LinkDirection.EAST_IN);
            selectedPipesNum += drawSelections(node, link, LinkDirectionInternal.LINK_IN);
            selectedPipesNum += drawSelections(node, link, LinkDirectionInternal.LINK_OUT);

            // console.log('pipes?', selectedPipesNum)

            if (selectedPipesNum > 0) {
                link.append('circle')
                    .attr('cx', 20)
                    .attr('cy', NODE_SIZE - 20)
                    .attr('r', ROUTER_SIZE / 2)
                    .attr('fill', 'none')
                    .attr('stroke', '#939393')
                    .attr('stroke-width', 3)
                    .style('pointer-events', 'none');
            }
        });
        const permEnd = performance.now();
        console.log(`perm: ${permEnd - permSt}`);

        nodes.on('click', (event: PointerEvent, d) => {
            d.selected = !d.selected;
            console.log(d);
            setSvgData({...svgData});
        });
    }, [svgData, showEmptyLinks]);

    return (
        <>
            <div className="top-bar">
                <div>
                    <Tooltip2 content="Show all links overlay" position={Position.RIGHT}>
                        <Switch checked={showEmptyLinks} label="" onChange={(event) => setShowEmptyLinks(event.currentTarget.checked)}/>
                    </Tooltip2>
                </div>
            </div>
            <div className="grid-container" style={{width: `${gridWidth}px`}}>
                <svg className="svg-grid" ref={svgRef} width={gridWidth} height={gridHeight}/>
            </div>
        </>
    );
}
