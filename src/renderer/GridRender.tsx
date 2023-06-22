import React, {useContext, useEffect, useRef, useState} from 'react';
import * as d3 from 'd3';
import {zoom} from 'd3';
import DataSource from '../data/DataSource';
import {ComputeNode, LinkDirection} from '../data/DataStructures';

export default function GridRender() {
    const {svgData} = useContext(DataSource);
    const svgRef = useRef();
    const [gridWidth, setGridWidth] = useState(0);
    const [gridHeight, setGridHeight] = useState(0);
    // let gridHeight = 0;

    useEffect(() => {
        // const list = svgData.nodes;
        const SVG_MARGIN = 0;
        const NODE_GAP = 1;
        const NODE_SIZE = 75;
        const ROUTER_SIZE = 20;


        // @ts-ignore
        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const zoomBehavior = zoom()
            .on('zoom', (event) => {
                const {transform} = event;
                svg.attr('transform', transform);
            });


        // @ts-ignore
        // svg = svg.call(zoomBehavior).call(zoomBehavior.transform, d3.zoomIdentity);
        // zoomBehavior.translateExtent([[-this.props.width, -this.props.height], [2*this.props.width, 2*this.props.height]]);
        zoomBehavior.scaleExtent([1, 4]);

        const nodeData: ComputeNode[] = svgData.nodes;


        setGridWidth((svgData.totalCols + 1) * (NODE_SIZE + NODE_GAP) + SVG_MARGIN * 2);
        setGridHeight((svgData.totalRows + 1) * (NODE_SIZE + NODE_GAP) + SVG_MARGIN * 2);


        // Create scales for positioning elements
        // const xScale = d3.scaleLinear().range([0, gridWidth]).domain([0, gridSize]);
        // const yScale = d3
        //     .scaleLinear()
        //     .range([0, gridHeight])
        //     .domain([0, gridSize]);

        // Draw grid squares
        // @ts-ignore
        const nodes = svg
            .selectAll('g')
            .data(nodeData)
            .enter()
            .append('g')
            .attr('fill', '#d7d7d7')
            .attr('fill-opacity', '1')
            .attr('transform', (d: ComputeNode) => {
                return `translate(${d.loc.x * (NODE_SIZE + NODE_GAP) + SVG_MARGIN},${d.loc.y * (NODE_SIZE + NODE_GAP) + SVG_MARGIN})`;
            });

        nodes
            .append('rect')
            .attr('class', 'node')
            .attr('width', NODE_SIZE)
            .attr('height', NODE_SIZE);

        // .attr('stroke', 'steelblue');

        nodes
            .append('rect')
            .attr('class', (d) => `node-type-${d.getType()}`)
            .attr('x', NODE_SIZE - 20)
            .attr('y', 5)
            .attr('fill', 'none')
            .attr('stroke', '#939393')
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

        nodes
            .append('text')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', 15)
            .attr('font-size', 5)
            .text((d) => d.opName)
            .attr('text-anchor', 'left')
            .attr('alignment-baseline', 'hanging')
            .attr('fill', '#000000')
            .style('pointer-events', 'none');

        // router
        const links = nodes.append('g').attr('class', 'links');

        nodes
            .append('circle')
            .attr('cx', 20)
            .attr('cy', NODE_SIZE - 20)
            .attr('r', ROUTER_SIZE / 2)
            .attr('fill', 'none')
            // .attr('fill-opacity', 0.5)
            // .attr('stroke', '#939393')
            .attr('stroke', '#939393')
            .attr('stroke-width', 3)
            .style('pointer-events', 'none');

        // Draw arrow line
        // accepts direction as 'up', 'down', 'left', 'right'

        const drawArrow = (selector, direction: LinkDirection) => {


            const STARTING_POINT = 20; // offset from the edge
            const LINE_OFFSET = 25; // (for router)


            let lineStartX = STARTING_POINT;
            let lineEndX = STARTING_POINT;
            let lineStartY = 0;

            let lineEndY = NODE_SIZE;

            const arrowHeadHeight = 9;
            const arrowHeadWidth = 9;

            let arrowOffset = 0;

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

                    arr1 = `${lineEndX - arrowHeadWidth / 2},${
                        lineStartY + arrowHeadHeight + arrowOffset
                    }`;
                    arr2 = `${lineEndX + arrowHeadWidth / 2},${
                        lineStartY + arrowHeadHeight + arrowOffset
                    }`;
                    arr3 = `${lineEndX},${lineStartY + arrowOffset}`;
                    break;
                case LinkDirection.SOUTH_IN:
                    // up in
                    arrowOffset = 3;
                    lineStartX += xOff;
                    lineEndX += xOff;

                    lineStartY = NODE_SIZE - LINE_OFFSET + (ROUTER_SIZE / 2);
                    lineEndY = NODE_SIZE;
                    // lineEndY -= STARTING_POINT;

                    arr1 = `0,0`;
                    arr2 = `0,0`;
                    arr3 = `0,0`;

                    arr1 = `${lineEndX - arrowHeadWidth / 2},${
                        lineStartY + arrowHeadHeight + arrowOffset
                    }`;
                    arr2 = `${lineEndX + arrowHeadWidth / 2},${
                        lineStartY + arrowHeadHeight + arrowOffset
                    }`;
                    arr3 = `${lineEndX},${lineStartY + arrowOffset}`;
                    // lineStartX = 0;
                    // lineStartY = 0;
                    // lineEndX = 0;
                    // lineEndY = 0;


                    break;
                case LinkDirection.NORTH_IN:
                    // down in

                    arrowOffset = 20;
                    lineStartX -= xOff;
                    lineEndX -= xOff;
                    lineEndY -= LINE_OFFSET;
                    arr1 = `${lineEndX - arrowHeadWidth / 2},${
                        lineEndY - arrowHeadHeight - arrowOffset
                    }`;
                    arr2 = `${lineEndX + arrowHeadWidth / 2},${
                        lineEndY - arrowHeadHeight - arrowOffset
                    }`;
                    arr3 = `${lineEndX},${lineEndY - arrowOffset}`;

                    break;
                case LinkDirection.SOUTH_OUT:
                    // down out

                    arrowOffset = 0;
                    lineStartX -= xOff;
                    lineEndX -= xOff;
                    lineStartY = NODE_SIZE - LINE_OFFSET + (ROUTER_SIZE / 2);
                    lineEndY = NODE_SIZE;
                    arr1 = `${lineEndX - arrowHeadWidth / 2},${
                        lineEndY - arrowHeadHeight - arrowOffset
                    }`;
                    arr2 = `${lineEndX + arrowHeadWidth / 2},${
                        lineEndY - arrowHeadHeight - arrowOffset
                    }`;
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
                    arr1 = `${lineStartX + arrowHeadHeight + arrowOffset},${
                        lineEndY - arrowHeadWidth / 2
                    }`;
                    arr2 = `${lineStartX + arrowHeadHeight + arrowOffset},${
                        lineEndY + arrowHeadWidth / 2
                    }`;
                    arr3 = `${lineStartX + arrowOffset},${lineEndY}`;


                    // lineStartX = 0;
                    // lineStartY = 0;
                    // lineEndX = 0;
                    // lineEndY = 0;

                    break;
                case LinkDirection.WEST_OUT:
                    // left out
                    arrowOffset = 0;
                    lineStartX = 0
                    lineEndX = LINE_OFFSET - ROUTER_SIZE / 2;
                    lineStartY = NODE_SIZE - STARTING_POINT + yOff;
                    lineEndY = NODE_SIZE - STARTING_POINT + yOff;
                    // lineStartX += LINE_OFFSET;
                    arr1 = `${lineStartX + arrowHeadHeight + arrowOffset},${
                        lineEndY - arrowHeadWidth / 2
                    }`;
                    arr2 = `${lineStartX + arrowHeadHeight + arrowOffset},${
                        lineEndY + arrowHeadWidth / 2
                    }`;
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
                    arr1 = `${lineEndX - arrowHeadHeight - arrowOffset},${
                        lineEndY - arrowHeadWidth / 2
                    }`;
                    arr2 = `${lineEndX - arrowHeadHeight - arrowOffset},${
                        lineEndY + arrowHeadWidth / 2
                    }`;
                    arr3 = `${lineEndX - arrowOffset},${lineEndY}`;
                    break;
                case LinkDirection.WEST_IN:
                    // right in
                    arrowOffset = 5;
                    lineStartX = 0;
                    lineEndX = LINE_OFFSET - ROUTER_SIZE / 2;
                    lineStartY = NODE_SIZE - STARTING_POINT - yOff;
                    lineEndY = NODE_SIZE - STARTING_POINT - yOff;
                    arr1 = `${lineEndX - arrowHeadHeight - arrowOffset},${
                        lineEndY - arrowHeadWidth / 2
                    }`;
                    arr2 = `${lineEndX - arrowHeadHeight - arrowOffset},${
                        lineEndY + arrowHeadWidth / 2
                    }`;
                    arr3 = `${lineEndX - arrowOffset},${lineEndY}`;
                    break;
                default:
                    lineStartX = 0;
                    lineStartY = 0;
                    lineEndX = 0;
                    lineEndY = 0;
                    console.warn(`Invalid direction ${direction}`);
            }


            const getColor = (d: ComputeNode) => {
                const selected = d
                    .getLinksForDirection(direction)
                    .filter((link) => {
                        return link.selected;
                    });
                if (selected.length > 0) {
                    return '#AD2E00'; // '#3A3A46';
                }
                return '#939393';
            };

            // Draw line
            selector
                .append('line')
                .attr('class', `arrow-${direction}`)
                .attr('x1', lineStartX)
                .attr('y1', lineStartY)
                .attr('x2', lineEndX)
                .attr('y2', lineEndY)
                .attr('stroke-width', 3)
                .attr('stroke', (d: ComputeNode) => {
                    return getColor(d);
                });

            // Draw arrowhead
            selector
                .append('polygon')
                .attr('points', `${arr1} ${arr2} ${arr3}`)
                .attr('fill', (d => {
                    return getColor(d);
                }));

        };


        // const directions = Object.values(LinkDirection);
        // console.log(directions);
        // for (const dir of directions) {
        //     if (dir !== LinkDirection.NONE) {
        //         drawArrow(links, dir);
        //         console.log('drawing', dir);
        //     }
        // }
        Object.entries(LinkDirection).forEach(([key, direction]) => {
            if (direction !== LinkDirection.NONE) {
                drawArrow(links, LinkDirection[key]);
            }
        });

        // drawArrow(links, LinkDirection.NORTH_IN);
        // drawArrow(links, LinkDirection.NORTH_OUT);
        // drawArrow(links, LinkDirection.SOUTH_IN);
        // drawArrow(links, LinkDirection.SOUTH_OUT);
        // drawArrow(links, LinkDirection.EAST_IN);
        // drawArrow(links, LinkDirection.EAST_OUT);
        // drawArrow(links, LinkDirection.WEST_IN);
        // drawArrow(links, LinkDirection.WEST_OUT);

        // <g>
        // <line x1="119" x2="119" y1="150" y2="95" visibility="" stroke="#3A3A46" stroke-width="3" stroke-dasharray="" stroke-dashoffset="0" style="cursor: pointer;"></line>
        // <polygon stroke="black" points="124,120.5 114,120.5 119,110.5 124,120.5" visibility="" fill="#3A3A46" stroke-width="0"></polygon>
        // </g>


        nodes.on('click', (event: PointerEvent, d) => {
            // @ts-ignore
            console.log(d);
            console.log(d.links)
            // console.log(d.json.links);
        });
    }, [svgData]);


    // }, [list]);
    // const pipeDrawings = svg
    //     .selectAll('g')
    //     .data(nodeList)
    //     .enter()
    //     .append('g')
    //     .attr('fill', '#ffffff')
    //     .attr('transform', (d: ComputeNode, i) => {
    //         return `translate(
    //         ${d.loc.x * squareSize},
    //         ${d.loc.y * squareSize}
    //         )`;
    //     });
    const randomColor = () => {
        const red = Math.floor(Math.random() * 200);
        const green = Math.floor(Math.random() * 200);
        const blue = Math.floor(Math.random() * 200);

        // eslint-disable-next-line no-bitwise
        const hex = ((red << 16) | (green << 8) | blue)
            .toString(16)
            .padStart(6, '0');

        return `#${hex}`;
    };

    /* ALWAYS ON */

    //     type: core
    //     op_name: layernorm_91.dc.sqrt.6
    //     op_cycles: 1000

    return (
        <div className="grid-container">
            <svg
                className="svg-grid"
                ref={svgRef}
                width={gridWidth}
                height={gridHeight}
            />
        </div>
    );
}
