import * as d3 from 'd3';
import {ComputeNode, DramID, LinkID} from '../data/DataStructures';
import getPipeColor from '../data/ColorGenerator';

export const NODE_SIZE = 100;
const NOC_CENTER = {x: 30, y: NODE_SIZE - 30};
const CENTER_DISPERSION = 10; // dispersion from the starting point
const NOC_0_X_OFFSET = -CENTER_DISPERSION;
const NOC_0_Y_OFFSET = -CENTER_DISPERSION;
const NOC_1_X_OFFSET = CENTER_DISPERSION;
const NOC_1_Y_OFFSET = CENTER_DISPERSION;
const CORE_CENTER = {x: NODE_SIZE - 20, y: 20};
const CORE_DISPERSION = 2;

export const NOC_CONFIGURATION = {
    noc0: {x: NOC_CENTER.x + NOC_0_X_OFFSET, y: NOC_CENTER.y + NOC_0_Y_OFFSET},
    noc1: {x: NOC_CENTER.x + NOC_1_X_OFFSET, y: NOC_CENTER.y + NOC_1_Y_OFFSET},
    core: {x: CORE_CENTER.x, y: CORE_CENTER.y},
};

export const drawLink = (selector: d3.Selection<SVGSVGElement | null, unknown, null, undefined>, direction: LinkID, color?: string, stroke: number = 1) => {
    const {lineEndX, lineEndY, lineStartX, lineStartY, arrow, arrowSecondary, transform} = getLinkPoints(direction);
    const {arr1, arr2, arr3} = arrow;
    const {arr4, arr5, arr6} = arrowSecondary;

    /** TEMP DEBUGGING COLOR FUNCTION */
    // const getColor = () => {
    //     if (direction.includes('noc0')) {
    //         return direction.includes('_in') ? '#ff0000' : '#ff6600';
    //     }
    //     if (direction.includes('noc1')) {
    //         return direction.includes('_in') ? '#0000ff' : '#0066ff';
    //     }
    // };

    // Draw line
    selector
        // keeping this here for the prettier
        .append('line')
        // .attr('class', `arrow-${direction}`) // class name is only for debugging
        .attr('x1', lineStartX)
        .attr('y1', lineStartY)
        .attr('x2', lineEndX)
        .attr('y2', lineEndY)
        .attr('stroke-width', stroke)
        .attr('stroke', color || '#4d4d4d');

    // arrowhead
    if (direction !== LinkID.NOC1_SOUTH_IN && direction !== LinkID.NOC0_WEST_IN && direction !== LinkID.NOC0_SOUTH_OUT && direction !== LinkID.NOC1_WEST_OUT) {
        selector
            // keeping this here for the prettier
            .append('polygon')
            .attr('points', `${arr1} ${arr2} ${arr3}`)
            .attr('transform', transform)
            .attr('class', `arrow-${direction}`)
            .attr('fill', '#7e7e7e');
    }
};
export const getLinkPoints = (direction: LinkID | DramID) => {
    let lineStartX: number;
    let lineEndX: number;
    let lineStartY: number;
    let lineEndY: number;

    const arrowHeadHeight = 9;
    const arrowHeadWidth = 9;

    let arrowOffset = 10;
    let transform = '';
    let angle = 0;

    let arr1;
    let arr2;
    let arr3;

    let arrowSecondary = {arr4: '', arr5: '', arr6: ''};

    switch (direction) {
        case LinkID.NOC1_NORTH_OUT:
            // up out
            arrowOffset = 5;
            lineStartX = NOC_CENTER.x + NOC_1_X_OFFSET;
            lineStartY = NOC_CENTER.y + NOC_1_Y_OFFSET;
            lineEndX = NOC_CENTER.x + NOC_1_X_OFFSET;
            lineEndY = 0;

            arr1 = `${lineEndX - arrowHeadWidth / 2},${lineEndY + arrowHeadHeight + arrowOffset}`;
            arr2 = `${lineEndX + arrowHeadWidth / 2},${lineEndY + arrowHeadHeight + arrowOffset}`;
            arr3 = `${lineEndX},${lineEndY + arrowOffset}`;
            break;
        case LinkID.NOC1_SOUTH_IN:
            // up in
            arrowOffset = 5;

            lineStartX = NOC_CENTER.x + NOC_1_X_OFFSET;
            lineStartY = NODE_SIZE;
            lineEndX = NOC_CENTER.x + NOC_1_X_OFFSET;
            lineEndY = NOC_CENTER.y + NOC_1_Y_OFFSET;

            arr1 = `0,0`;
            arr2 = `0,0`;
            arr3 = `0,0`;

            arr1 = `${lineEndX - arrowHeadWidth / 2},${lineEndY + arrowHeadHeight + arrowOffset}`;
            arr2 = `${lineEndX + arrowHeadWidth / 2},${lineEndY + arrowHeadHeight + arrowOffset}`;
            arr3 = `${lineEndX},${lineEndY + arrowOffset}`;

            break;

        case LinkID.NOC1_EAST_IN:
            // left in

            arrowOffset = 10;
            lineStartX = NODE_SIZE;
            lineEndX = NOC_CENTER.x + NOC_1_X_OFFSET;
            lineStartY = NOC_CENTER.y + NOC_1_Y_OFFSET;
            lineEndY = NOC_CENTER.y + NOC_1_Y_OFFSET;

            arr1 = `${lineEndX + arrowHeadHeight + arrowOffset},${lineEndY - arrowHeadWidth / 2}`;
            arr2 = `${lineEndX + arrowHeadHeight + arrowOffset},${lineEndY + arrowHeadWidth / 2}`;
            arr3 = `${lineEndX + arrowOffset},${lineEndY}`;

            break;
        case LinkID.NOC1_WEST_OUT:
            // left out
            arrowOffset = 0;

            lineStartX = NOC_CENTER.x + NOC_1_X_OFFSET;
            lineEndX = 0;
            lineStartY = NOC_CENTER.y + NOC_1_Y_OFFSET;
            lineEndY = NOC_CENTER.y + NOC_1_Y_OFFSET;
            // lineStartX += LINE_OFFSET;
            arr1 = `${lineStartX + arrowHeadHeight + arrowOffset},${lineEndY - arrowHeadWidth / 2}`;
            arr2 = `${lineStartX + arrowHeadHeight + arrowOffset},${lineEndY + arrowHeadWidth / 2}`;
            arr3 = `${lineStartX + arrowOffset},${lineEndY}`;

            break;

        case LinkID.NOC0_NORTH_IN:
            // down in

            lineStartX = NOC_CENTER.x + NOC_0_X_OFFSET;
            lineEndX = NOC_CENTER.x + NOC_0_X_OFFSET;
            lineStartY = 0;
            lineEndY = NOC_CENTER.y + NOC_0_Y_OFFSET;

            arr1 = `${lineEndX - arrowHeadWidth / 2},${lineEndY - arrowHeadHeight - arrowOffset}`;
            arr2 = `${lineEndX + arrowHeadWidth / 2},${lineEndY - arrowHeadHeight - arrowOffset}`;
            arr3 = `${lineEndX},${lineEndY - arrowOffset}`;

            break;
        case LinkID.NOC0_SOUTH_OUT:
            // down out
            //
            lineStartX = NOC_CENTER.x + NOC_0_X_OFFSET;
            lineEndX = NOC_CENTER.x + NOC_0_X_OFFSET;
            lineStartY = NOC_CENTER.y + NOC_0_Y_OFFSET;
            lineEndY = NODE_SIZE;
            arr1 = `${lineEndX - arrowHeadWidth / 2},${lineEndY - arrowHeadHeight - arrowOffset}`;
            arr2 = `${lineEndX + arrowHeadWidth / 2},${lineEndY - arrowHeadHeight - arrowOffset}`;
            arr3 = `${lineEndX},${lineEndY - arrowOffset}`;

            break;
        //
        case LinkID.NOC0_EAST_OUT:
            // right out
            lineStartX = NOC_CENTER.x + NOC_0_X_OFFSET;
            lineEndX = NODE_SIZE;
            lineStartY = NOC_CENTER.y + NOC_0_Y_OFFSET;
            lineEndY = NOC_CENTER.y + NOC_0_Y_OFFSET;

            arr1 = `${lineEndX - arrowHeadHeight - arrowOffset},${lineEndY - arrowHeadWidth / 2}`;
            arr2 = `${lineEndX - arrowHeadHeight - arrowOffset},${lineEndY + arrowHeadWidth / 2}`;
            arr3 = `${lineEndX - arrowOffset},${lineEndY}`;
            break;
        case LinkID.NOC0_WEST_IN:
            // right in
            //     arrowOffset = 5;
            lineStartX = 0;
            lineEndX = NOC_CENTER.x + NOC_0_X_OFFSET;
            lineStartY = NOC_CENTER.y + NOC_0_Y_OFFSET;
            lineEndY = NOC_CENTER.y + NOC_0_Y_OFFSET;
            arr1 = `${lineEndX - arrowHeadHeight - arrowOffset},${lineEndY - arrowHeadWidth / 2}`;
            arr2 = `${lineEndX - arrowHeadHeight - arrowOffset},${lineEndY + arrowHeadWidth / 2}`;
            arr3 = `${lineEndX - arrowOffset},${lineEndY}`;
            break;

        case LinkID.NOC0_IN:
            arrowOffset = -10;
            lineStartX = NOC_CENTER.x + NOC_0_X_OFFSET - CORE_DISPERSION;
            lineEndX = CORE_CENTER.x + NOC_0_X_OFFSET - CORE_DISPERSION;
            lineStartY = NOC_CENTER.y + NOC_0_Y_OFFSET - CORE_DISPERSION;
            lineEndY = CORE_CENTER.y + NOC_0_Y_OFFSET - CORE_DISPERSION;

            arr1 = `${lineEndX - arrowHeadWidth / 2},${lineEndY + arrowHeadHeight - arrowOffset}`;
            arr2 = `${lineEndX + arrowHeadWidth / 2},${lineEndY + arrowHeadHeight - arrowOffset}`;
            arr3 = `${lineEndX},${lineEndY - arrowOffset}`;
            angle = (Math.atan2(lineEndY - lineStartY, lineEndX - lineStartX) * 180) / Math.PI + 90;

            transform = `rotate(${angle} ${lineEndX} ${lineEndY})`;
            break;
        case LinkID.NOC0_OUT:
            arrowOffset = -10;

            lineStartX = CORE_CENTER.x + NOC_0_X_OFFSET + CORE_DISPERSION;
            lineEndX = NOC_CENTER.x + NOC_0_X_OFFSET + CORE_DISPERSION;
            lineEndY = NOC_CENTER.y + NOC_0_Y_OFFSET + CORE_DISPERSION;
            lineStartY = CORE_CENTER.y + NOC_0_Y_OFFSET + CORE_DISPERSION;

            arr1 = `${lineEndX - arrowHeadWidth / 2},${lineEndY + arrowHeadHeight - arrowOffset}`;
            arr2 = `${lineEndX + arrowHeadWidth / 2},${lineEndY + arrowHeadHeight - arrowOffset}`;
            arr3 = `${lineEndX},${lineEndY - arrowOffset}`;
            angle = (Math.atan2(lineEndY - lineStartY, lineEndX - lineStartX) * 180) / Math.PI + 90;

            transform = `rotate(${angle} ${lineEndX} ${lineEndY})`;
            break;

        case LinkID.NOC1_IN:
            arrowOffset = -10;
            lineStartX = NOC_CENTER.x + NOC_1_X_OFFSET - CORE_DISPERSION;
            lineEndX = CORE_CENTER.x + NOC_1_X_OFFSET - CORE_DISPERSION;
            lineStartY = NOC_CENTER.y + NOC_1_Y_OFFSET - CORE_DISPERSION;
            lineEndY = CORE_CENTER.y + NOC_1_Y_OFFSET - CORE_DISPERSION;

            arr1 = `${lineEndX - arrowHeadWidth / 2},${lineEndY + arrowHeadHeight - arrowOffset}`;
            arr2 = `${lineEndX + arrowHeadWidth / 2},${lineEndY + arrowHeadHeight - arrowOffset}`;
            arr3 = `${lineEndX},${lineEndY - arrowOffset}`;
            angle = (Math.atan2(lineEndY - lineStartY, lineEndX - lineStartX) * 180) / Math.PI + 90;

            transform = `rotate(${angle} ${lineEndX} ${lineEndY})`;
            break;
        case LinkID.NOC1_OUT:
            arrowOffset = -10;

            lineStartX = CORE_CENTER.x + NOC_1_X_OFFSET + CORE_DISPERSION;
            lineEndX = NOC_CENTER.x + NOC_1_X_OFFSET + CORE_DISPERSION;
            lineEndY = NOC_CENTER.y + NOC_1_Y_OFFSET + CORE_DISPERSION;
            lineStartY = CORE_CENTER.y + NOC_1_Y_OFFSET + CORE_DISPERSION;

            arr1 = `${lineEndX - arrowHeadWidth / 2},${lineEndY + arrowHeadHeight - arrowOffset}`;
            arr2 = `${lineEndX + arrowHeadWidth / 2},${lineEndY + arrowHeadHeight - arrowOffset}`;
            arr3 = `${lineEndX},${lineEndY - arrowOffset}`;
            angle = (Math.atan2(lineEndY - lineStartY, lineEndX - lineStartX) * 180) / Math.PI + 90;

            transform = `rotate(${angle} ${lineEndX} ${lineEndY})`;
            break;
        case DramID.NOC_IN:
            lineStartX = NOC_CENTER.x + NOC_0_X_OFFSET;
            lineEndX = NOC_CENTER.x + NOC_0_X_OFFSET;
            lineStartY = 0;
            lineEndY = NOC_CENTER.y + NOC_1_Y_OFFSET;

            arr1 = `${lineEndX - arrowHeadWidth / 2},${lineEndY - arrowHeadHeight - arrowOffset}`;
            arr2 = `${lineEndX + arrowHeadWidth / 2},${lineEndY - arrowHeadHeight - arrowOffset}`;
            arr3 = `${lineEndX},${lineEndY - arrowOffset}`;

            break;

        case DramID.NOC_OUT:
            arrowOffset = 5;
            lineStartX = NOC_CENTER.x + NOC_1_X_OFFSET;
            lineStartY = NOC_CENTER.y + NOC_1_Y_OFFSET;
            lineEndX = NOC_CENTER.x + NOC_1_X_OFFSET;
            lineEndY = 0;

            arr1 = `${lineEndX - arrowHeadWidth / 2},${lineEndY + arrowHeadHeight + arrowOffset}`;
            arr2 = `${lineEndX + arrowHeadWidth / 2},${lineEndY + arrowHeadHeight + arrowOffset}`;
            arr3 = `${lineEndX},${lineEndY + arrowOffset}`;
            break;
        case DramID.NOC0_NOC2AXI:
        case DramID.NOC1_NOC2AXI:
            arrowOffset = 5;
            lineStartX = NOC_CENTER.x + NOC_1_X_OFFSET;
            lineStartY = NOC_CENTER.y + NOC_1_Y_OFFSET;
            lineEndX = NOC_CENTER.x + NOC_1_X_OFFSET;
            lineEndY = 0;

            arr1 = `${lineEndX - arrowHeadWidth / 2},${lineEndY + arrowHeadHeight + arrowOffset}`;
            arr2 = `${lineEndX + arrowHeadWidth / 2},${lineEndY + arrowHeadHeight + arrowOffset}`;
            arr3 = `${lineEndX},${lineEndY + arrowOffset}`;

            arrowSecondary = {
                arr4: `${lineStartX - arrowHeadWidth / 2},${lineStartY - arrowHeadHeight - arrowOffset}`,
                arr5: `${lineStartX + arrowHeadWidth / 2},${lineStartY - arrowHeadHeight - arrowOffset}`,
                arr6: `${lineStartX},${lineStartY - arrowOffset}`,
            };

            break;
        default:
            lineStartX = 0;
            lineStartY = 0;
            lineEndX = 0;
            lineEndY = 0;
        // console.warn(`Invalid direction ${direction}`);
    }
    return {lineEndX, lineEndY, lineStartX, lineStartY, arrow: {arr1, arr2, arr3}, arrowSecondary, transform};
};

export const drawPipesDirect = (svg: d3.Selection<SVGSVGElement | null, unknown, null, undefined>, direction: LinkID | DramID, pipeIds: string[]) => {
    const {lineEndX, lineEndY, lineStartX, lineStartY, arrow, arrowSecondary, transform} = getLinkPoints(direction);
    const {arr1, arr2, arr3} = arrow;
    const {arr4, arr5, arr6} = arrowSecondary;
    const strokeLength = 5;
    if (pipeIds.length) {
        if (direction !== LinkID.NOC1_SOUTH_IN && direction !== LinkID.NOC0_WEST_IN && direction !== LinkID.NOC0_SOUTH_OUT && direction !== LinkID.NOC1_WEST_OUT) {
            svg
                // only draw arrows for long links
                .append('polygon')
                .attr('points', `${arr1} ${arr2} ${arr3}`)
                .attr('transform', transform)
                .attr('fill', '#9e9e9e');
        }
        if (direction === DramID.NOC0_NOC2AXI || direction === DramID.NOC1_NOC2AXI) {
            svg
                // only draw arrows for long links
                .append('polygon')
                .attr('points', `${arr4} ${arr5} ${arr6}`)
                .attr('transform', transform)
                .attr('fill', '#9e9e9e');
        }
    }
    const dashArray = [strokeLength, (pipeIds.length - 1) * strokeLength];
    pipeIds.forEach((pipeId: string, index: number) => {
        svg.append('line')
            // keep prettier at bay
            // .attr('class', `arrow-${direction}`) // class name is only for debugging
            .attr('x1', lineStartX)
            .attr('y1', lineStartY)
            .attr('x2', lineEndX)
            .attr('y2', lineEndY)
            .attr('stroke-width', 2)
            .attr('stroke', getPipeColor(pipeId))
            .attr('stroke-dasharray', dashArray.join(','))
            .attr('stroke-dashoffset', index * dashArray[0]);
    });
};

export const drawSelections = (svg: d3.Selection<SVGSVGElement | null, unknown, null, undefined>, direction: LinkID, node: ComputeNode, selectedPipeIds: string[]) => {
    const nodePipeIds = node.getPipesForDirection(direction);
    const pipeIds = nodePipeIds.filter((pipeId) => selectedPipeIds.includes(pipeId));
    drawPipesDirect(svg, direction, pipeIds);
    return pipeIds.length;
};

export const drawNOC = (svg: d3.Selection<SVGSVGElement | null, unknown, null, undefined>, point: { x: number; y: number }) => {
    svg.append('circle')
        //
        .attr('cx', point.x)
        .attr('cy', point.y)
        .attr('r', 4)
        .attr('stroke-width', 2)
        .attr('fill', '#9e9e9e')
        .attr('stroke', '#9e9e9e');
};

export const calculateLinkCongestionColor = (value: number, min: number = 0): string => {
    const max = 120;
    const normalizedVal = Math.min(value, max);
    const ratio = (normalizedVal - min) / (max - min);
    const intensity = Math.round(ratio * 255);
    return `rgb(${intensity}, ${255 - intensity}, 0)`;
};
