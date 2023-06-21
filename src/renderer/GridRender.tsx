import React, {useContext, useEffect, useRef, useState} from 'react';
import * as d3 from 'd3';
import {zoom} from 'd3';
import DataSource from '../data/DataSource';
import {ComputeNode, LinkDirection, NOCLink} from '../data/DataStructures';

export default function GridRender() {
    const {svgData} = useContext(DataSource);
    const svgRef = useRef();
    const [gridWidth, setGridWidth] = useState(0);
    const [gridHeight, setGridHeight] = useState(0);
    // let gridHeight = 0;

    useEffect(() => {

        // const list = svgData.nodes;
        const NODE_GAP = 0;
        const NODE_SIZE = 65;


        // @ts-ignore
        let svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const zoomBehavior = zoom()
            .on('zoom', (event) => {
                const {transform} = event;
                svg.attr('transform', transform);
            });


        // @ts-ignore
        svg = svg.call(zoomBehavior).call(zoomBehavior.transform, d3.zoomIdentity);
        // zoomBehavior.translateExtent([[-this.props.width, -this.props.height], [2*this.props.width, 2*this.props.height]]);
        zoomBehavior.scaleExtent([1, 4]);

        const nodeData: ComputeNode[] = svgData.nodes;


        // const pipes = new Map();
        // list.reverse().forEach((el) => {
        //     const loc: Loc = { x: el.location[1], y: el.location[0] };
        //     for (const noc in el.links) {
        //         console.log(el.links[noc].mapped_pipes);
        //         for (const pipe in el.links[noc].mapped_pipes) {
        //             if (!pipes.has(pipe)) {
        //                 pipes.set(pipe, []);
        //             }
        //             pipes.get(pipe).push(loc);
        //         }
        //     }
        // });
        //
        //
        // console.log(pipes);


        setGridWidth((svgData.totalCols + 1) * (NODE_SIZE + NODE_GAP));
        setGridHeight((svgData.totalRows + 1) * (NODE_SIZE + NODE_GAP));


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
                return `translate(${d.loc.x * (NODE_SIZE + NODE_GAP)},${d.loc.y * (NODE_SIZE + NODE_GAP)})`;
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
            .attr('text-anchor', 'middle')
            .attr('alignment-baseline', 'hanging')
            .attr('fill', '#000000')
            .style('pointer-events', 'none');

        // router
        const links = nodes.append('g').attr('class', 'links');

        nodes
            .append('circle')
            .attr('cx', 10)
            .attr('cy', NODE_SIZE - 10)
            .attr('r', 10)
            .attr('fill', 'none')
            // .attr('fill-opacity', 0.5)
            // .attr('stroke', '#939393')
            .attr('stroke', '#3A3A46')
            .attr('stroke-width', 1)
            .style('pointer-events', 'none');

        // Draw arrow line
        // accepts direction as 'up', 'down', 'left', 'right'

        const drawArrow = (selector, direction: LinkDirection) => {


            let lineStartX = 10;
            let lineEndX = 10;
            let lineStartY = 0;
            let lineEndY = NODE_SIZE;

            const arrowHeadHeight = 10;
            const arrowHeadWidth = 10;

            let arrowOffset = 0;

            let arr1;
            let arr2;
            let arr3;

            const xOff = 4;
            const yOff = 4;

            switch (direction) {
                case LinkDirection.UP:
                    arrowOffset = 5;
                    lineStartX += xOff;
                    lineEndX += xOff;
                    arr1 = `${lineEndX - arrowHeadWidth / 2},${
                        lineStartY + arrowHeadHeight + arrowOffset
                    }`;
                    arr2 = `${lineEndX + arrowHeadWidth / 2},${
                        lineStartY + arrowHeadHeight + arrowOffset
                    }`;
                    arr3 = `${lineEndX},${lineStartY + arrowOffset}`;
                    break;
                case LinkDirection.DOWN:
                    arrowOffset = 20;
                    lineStartX -= xOff;
                    lineEndX -= xOff;
                    arr1 = `${lineEndX - arrowHeadWidth / 2},${
                        lineEndY - arrowHeadHeight - arrowOffset
                    }`;
                    arr2 = `${lineEndX + arrowHeadWidth / 2},${
                        lineEndY - arrowHeadHeight - arrowOffset
                    }`;
                    arr3 = `${lineEndX},${lineEndY - arrowOffset}`;
                    break;
                case LinkDirection.LEFT:
                    arrowOffset = 20;
                    lineStartX = 0;
                    lineEndX = NODE_SIZE;
                    lineStartY = NODE_SIZE - 10 + yOff;
                    lineEndY = NODE_SIZE - 10 + yOff;
                    arr1 = `${lineStartX + arrowHeadHeight + arrowOffset},${
                        lineEndY - arrowHeadWidth / 2
                    }`;
                    arr2 = `${lineStartX + arrowHeadHeight + arrowOffset},${
                        lineEndY + arrowHeadWidth / 2
                    }`;
                    arr3 = `${lineStartX + arrowOffset},${lineEndY}`;
                    break;
                case LinkDirection.RIGHT:
                    arrowOffset = 5;
                    lineStartX = 0;
                    lineEndX = NODE_SIZE;
                    lineStartY = NODE_SIZE - 10 - yOff;
                    lineEndY = NODE_SIZE - 10 - yOff;
                    arr1 = `${lineEndX - arrowHeadHeight - arrowOffset},${
                        lineEndY - arrowHeadWidth / 2
                    }`;
                    arr2 = `${lineEndX - arrowHeadHeight - arrowOffset},${
                        lineEndY + arrowHeadWidth / 2
                    }`;
                    arr3 = `${lineEndX - arrowOffset},${lineEndY}`;
                    break;
                default:
                    console.warn(`Invalid direction ${direction}`);
            }


            const getColor = (d: ComputeNode) => {
                const selected = d.getLinksForDirection(direction).filter(link => {
                    return link.selected
                })
                if (selected.length > 0) {
                    console.log('this is selected', selected)
                    return '#AD2E00';//'#3A3A46';
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
                .attr('stroke', (d => {
                    return getColor(d);
                }));

            // Draw arrowhead
            selector
                .append('polygon')
                .attr('points', `${arr1} ${arr2} ${arr3}`)
                .attr('fill', (d => {
                    return getColor(d);
                }));

        };

        drawArrow(links, LinkDirection.DOWN);
        drawArrow(links, LinkDirection.UP);
        drawArrow(links, LinkDirection.LEFT);
        drawArrow(links, LinkDirection.RIGHT);

        // <g>
        // <line x1="119" x2="119" y1="150" y2="95" visibility="" stroke="#3A3A46" stroke-width="3" stroke-dasharray="" stroke-dashoffset="0" style="cursor: pointer;"></line>
        // <polygon stroke="black" points="124,120.5 114,120.5 119,110.5 124,120.5" visibility="" fill="#3A3A46" stroke-width="0"></polygon>
        // </g>


        nodes.on('click', (event: PointerEvent, d) => {
            // @ts-ignore
            console.log(d.links);
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
