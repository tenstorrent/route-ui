import * as d3 from 'd3';
import {ComputeNode, LinkDirection, LinkDirectionInternal} from '../data/DataStructures';

export const SVG_MARGIN = 0;
export const NODE_GAP = 1;
export const NODE_SIZE = 80;
export const ROUTER_SIZE = 20;
export const drawArrow = (selector: d3.Selection<SVGSVGElement | null, unknown, null, undefined>, direction: LinkDirection | LinkDirectionInternal) => {
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
export const getLinkDrawing = (direction: LinkDirection | LinkDirectionInternal) => {
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
