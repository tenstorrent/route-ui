import React, {
    useContext, useEffect,
    useRef, useState
} from 'react';
import * as d3 from 'd3';
import { zoom } from 'd3';
import DataSource from '../data/DataSource';
import SVGData, { ComputeNode, Loc } from '../data/DataStructures';
import './MainRouteRenderer.scss';

export default function MainRouteRenderer() {

    const {svgData} = useContext(DataSource);
    const svgRef = useRef();
    const [gridWidth, setGridWidth] = useState(0);
    const [gridHeight, setGridHeight] = useState(0);
    // let gridHeight = 0;

    useEffect(() => {

        // const list = svgData.nodes;
        const nodeGap = 1;

        // const svgRef: React.MutableRefObject<
        //     React.SVGProps<SVGSVGElement> | undefined
        // > = useRef();

        // @ts-ignore
        let svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const zoomBehavior = zoom()
            .on('zoom', (event) => {
                const {transform} = event;
                console.log(transform);
                svg.attr('transform', transform);
            });


        svg = svg
            .call(zoomBehavior)
            .call(zoomBehavior.transform, d3.zoomIdentity);
        // zoomBehavior.translateExtent([[-this.props.width, -this.props.height], [2*this.props.width, 2*this.props.height]]);
        zoomBehavior.scaleExtent([0.8, 4]);


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

        const squareSize = 50;
        setGridWidth((svgData.totalCols + 1) * (squareSize + nodeGap));
        setGridHeight((svgData.totalRows + 1) * (squareSize + nodeGap));


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
                return `translate(${d.loc.x * (squareSize + nodeGap)},${d.loc.y * (squareSize + nodeGap)})`;
            });

        nodes
            .append('rect')
            .attr('class', 'node')
            .attr('width', squareSize)
            .attr('height', squareSize);

        // .attr('stroke', 'steelblue');

        nodes
            .append('rect')
            .attr('class', (d) => `node-type-${d.getType()}`)
            .attr('x', squareSize - 20)
            .attr('y', 5)
            .attr('fill', 'none')
            .attr('stroke', '#939393')
            .attr('width', 15)
            .attr('height', 15)
            .style('pointer-events', 'none');

        nodes
            .append('text')
            .attr('x', squareSize - 20 + 7.5)
            .attr('y', 5)
            .attr('width', 15)
            .text((d) => d.getType())
            .attr('text-anchor', 'middle')
            .attr('alignment-baseline', 'hanging')
            .attr('fill', '#000000')
            .style('pointer-events', 'none');

        // router
        const links = nodes.append('g').attr('class', 'links');

        nodes
            .append('circle')
            .attr('cx', 10)
            .attr('cy', squareSize - 10)
            .attr('r', 10)
            .attr('fill', 'none')
            // .attr('fill-opacity', 0.5)
            // .attr('stroke', '#939393')
            .attr('stroke', '#3A3A46')
            .attr('stroke-width', 1)
            .style('pointer-events', 'none');

        // Draw arrow line
        // accepts direction as 'up', 'down', 'left', 'right'

        const drawArrow = (selector, direction: string) => {

            console.log(selector);

            let lineStartX = 10;
            let lineEndX = 10;
            let lineStartY = 0;
            let lineEndY = squareSize;

            const arrowHeadHeight = 10;
            const arrowHeadWidth = 10;

            let arrowOffset = 0;

            let arr1;
            let arr2;
            let arr3;

            const xOff = 4;
            const yOff = 4;

            switch (direction) {
                case 'up':
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
                case 'down':
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
                case 'left':
                    arrowOffset = 20;
                    lineStartX = 0;
                    lineEndX = squareSize;
                    lineStartY = squareSize - 10 + yOff;
                    lineEndY = squareSize - 10 + yOff;
                    arr1 = `${lineStartX + arrowHeadHeight + arrowOffset},${
                        lineEndY - arrowHeadWidth / 2
                    }`;
                    arr2 = `${lineStartX + arrowHeadHeight + arrowOffset},${
                        lineEndY + arrowHeadWidth / 2
                    }`;
                    arr3 = `${lineStartX + arrowOffset},${lineEndY}`;
                    break;
                case 'right':
                    arrowOffset = 5;
                    lineStartX = 0;
                    lineEndX = squareSize;
                    lineStartY = squareSize - 10 - yOff;
                    lineEndY = squareSize - 10 - yOff;
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


            // Draw line
            selector
                .append('line')
                .attr('class', `arrow-${direction}`)
                .attr('x1', lineStartX)
                .attr('y1', lineStartY)
                .attr('x2', lineEndX)
                .attr('y2', lineEndY)
                .attr('stroke-width', 3)
                .attr('stroke', '#3A3A46');

            // Draw arrowhead
            selector
                .append('polygon')
                .attr('points', `${arr1} ${arr2} ${arr3}`)
                .attr('fill', '#3A3A46');

        };

        drawArrow(links, 'up');
        drawArrow(links, 'down');
        drawArrow(links, 'left');
        drawArrow(links, 'right');

        // <g>
        // <line x1="119" x2="119" y1="150" y2="95" visibility="" stroke="#3A3A46" stroke-width="3" stroke-dasharray="" stroke-dashoffset="0" style="cursor: pointer;"></line>
        // <polygon stroke="black" points="124,120.5 114,120.5 119,110.5 124,120.5" visibility="" fill="#3A3A46" stroke-width="0"></polygon>
        // </g>


        nodes.on('click', (event: PointerEvent, d) => {
            // @ts-ignore
            console.log(d.loc);
            console.log(d.json.links);
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
