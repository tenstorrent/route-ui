import * as d3 from 'd3';
import { ComputeNode } from '../data/Chip';
import getPipeColor from '../data/ColorGenerator';
import { DramBankLinkName, DramNOCLinkName, LinkRenderType, NetworkLinkName, NOCLinkName } from '../data/Types';

export const NODE_SIZE = 100;
const NOC_CENTER = { x: 30, y: NODE_SIZE - 30 };
const CENTER_DISPERSION = 10; // dispersion from the starting point
const NOC_0_X_OFFSET = -CENTER_DISPERSION;
const NOC_0_Y_OFFSET = -CENTER_DISPERSION;
const NOC_1_X_OFFSET = CENTER_DISPERSION;
const NOC_1_Y_OFFSET = CENTER_DISPERSION;
const CORE_CENTER = { x: NODE_SIZE - 20, y: 20 };
const CORE_DISPERSION = 2;

export const NOC_CONFIGURATION = {
    noc0: { x: NOC_CENTER.x + NOC_0_X_OFFSET, y: NOC_CENTER.y + NOC_0_Y_OFFSET },
    noc1: { x: NOC_CENTER.x + NOC_1_X_OFFSET, y: NOC_CENTER.y + NOC_1_Y_OFFSET },
    core: { x: CORE_CENTER.x, y: CORE_CENTER.y },
};

export const drawLink = (
    selector: d3.Selection<SVGSVGElement | null, unknown, null, undefined>,
    linkName: NetworkLinkName,
    color?: string,
    stroke: number = 1,
    rendererType: LinkRenderType = LinkRenderType.GRID,
) => {
    const {
        //
        lineEndX,
        lineEndY,
        lineStartX,
        lineStartY,
        arrow,
        arrowSecondary,
        transform,
    } = getLinkPoints(linkName, rendererType);

    /** DEBUGGING FOR COLOR FUNCTION */
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
        .attr('x1', lineStartX)
        .attr('y1', lineStartY)
        .attr('x2', lineEndX)
        .attr('y2', lineEndY)
        .attr('stroke-width', stroke)
        .attr('stroke', color || '#4d4d4d');

    // arrowhead
    if (
        linkName !== NOCLinkName.NOC1_SOUTH_IN &&
        linkName !== NOCLinkName.NOC0_WEST_IN &&
        linkName !== NOCLinkName.NOC0_SOUTH_OUT &&
        linkName !== NOCLinkName.NOC1_WEST_OUT
    ) {
        selector
            // keeping this here for the prettier
            .append('polygon')
            .attr('points', `${arrow.p1} ${arrow.p2} ${arrow.p3}`)
            .attr('transform', transform)
            .attr('fill', color || '#7e7e7e');
    }
    if (linkName === DramNOCLinkName.NOC0_NOC2AXI || DramNOCLinkName.NOC1_NOC2AXI || DramBankLinkName.DRAM_INOUT) {
        selector
            //
            .append('polygon')
            .attr('points', `${arrowSecondary.p1} ${arrowSecondary.p2} ${arrowSecondary.p3}`)
            .attr('transform', transform)
            .attr('fill', color || '#7e7e7e');
    }
};
export const getLinkPoints = (linkName: NetworkLinkName, renderType: LinkRenderType = LinkRenderType.GRID) => {
    let lineStartX: number = 0;
    let lineEndX: number = 0;
    let lineStartY: number = 0;
    let lineEndY: number = 0;

    const arrowHeadHeight = 9;
    const arrowHeadWidth = 9;

    let arrowOffset = 10;
    let transform = '';
    let angle = 0;

    let arrow = { p1: '', p2: '', p3: '' };
    let arrowSecondary = { p1: '', p2: '', p3: '' };

    switch (linkName) {
        case NOCLinkName.NOC1_NORTH_OUT:
            // up out
            arrowOffset = 5;
            lineStartX = NOC_CENTER.x + NOC_1_X_OFFSET;
            lineStartY = NOC_CENTER.y + NOC_1_Y_OFFSET;
            lineEndX = NOC_CENTER.x + NOC_1_X_OFFSET;
            lineEndY = 0;
            arrow = {
                p1: `${lineEndX - arrowHeadWidth / 2},${lineEndY + arrowHeadHeight + arrowOffset}`,
                p2: `${lineEndX + arrowHeadWidth / 2},${lineEndY + arrowHeadHeight + arrowOffset}`,
                p3: `${lineEndX},${lineEndY + arrowOffset}`,
            };
            break;
        case NOCLinkName.NOC1_SOUTH_IN:
            // up in
            arrowOffset = 5;

            lineStartX = NOC_CENTER.x + NOC_1_X_OFFSET;
            lineStartY = NODE_SIZE;
            lineEndX = NOC_CENTER.x + NOC_1_X_OFFSET;
            lineEndY = NOC_CENTER.y + NOC_1_Y_OFFSET;

            arrow = {
                p1: `${lineEndX - arrowHeadWidth / 2},${lineEndY + arrowHeadHeight + arrowOffset}`,
                p2: `${lineEndX + arrowHeadWidth / 2},${lineEndY + arrowHeadHeight + arrowOffset}`,
                p3: `${lineEndX},${lineEndY + arrowOffset}`,
            };

            break;

        case NOCLinkName.NOC1_EAST_IN:
            // left in

            arrowOffset = 10;
            lineStartX = NODE_SIZE;
            lineEndX = NOC_CENTER.x + NOC_1_X_OFFSET;
            lineStartY = NOC_CENTER.y + NOC_1_Y_OFFSET;
            lineEndY = NOC_CENTER.y + NOC_1_Y_OFFSET;
            arrow = {
                p1: `${lineEndX + arrowHeadHeight + arrowOffset},${lineEndY - arrowHeadWidth / 2}`,
                p2: `${lineEndX + arrowHeadHeight + arrowOffset},${lineEndY + arrowHeadWidth / 2}`,
                p3: `${lineEndX + arrowOffset},${lineEndY}`,
            };

            break;
        case NOCLinkName.NOC1_WEST_OUT:
            // left out
            arrowOffset = 0;

            lineStartX = NOC_CENTER.x + NOC_1_X_OFFSET;
            lineEndX = 0;
            lineStartY = NOC_CENTER.y + NOC_1_Y_OFFSET;
            lineEndY = NOC_CENTER.y + NOC_1_Y_OFFSET;
            arrow = {
                p1: `${lineStartX + arrowHeadHeight + arrowOffset},${lineEndY - arrowHeadWidth / 2}`,
                p2: `${lineStartX + arrowHeadHeight + arrowOffset},${lineEndY + arrowHeadWidth / 2}`,
                p3: `${lineStartX + arrowOffset},${lineEndY}`,
            };

            break;

        case NOCLinkName.NOC0_NORTH_IN:
            // down in

            lineStartX = NOC_CENTER.x + NOC_0_X_OFFSET;
            lineEndX = NOC_CENTER.x + NOC_0_X_OFFSET;
            lineStartY = 0;
            lineEndY = NOC_CENTER.y + NOC_0_Y_OFFSET;
            arrow = {
                p1: `${lineEndX - arrowHeadWidth / 2},${lineEndY - arrowHeadHeight - arrowOffset}`,
                p2: `${lineEndX + arrowHeadWidth / 2},${lineEndY - arrowHeadHeight - arrowOffset}`,
                p3: `${lineEndX},${lineEndY - arrowOffset}`,
            };

            break;
        case NOCLinkName.NOC0_SOUTH_OUT:
            // down out
            //
            lineStartX = NOC_CENTER.x + NOC_0_X_OFFSET;
            lineEndX = NOC_CENTER.x + NOC_0_X_OFFSET;
            lineStartY = NOC_CENTER.y + NOC_0_Y_OFFSET;
            lineEndY = NODE_SIZE;
            arrow = {
                p1: `${lineEndX - arrowHeadWidth / 2},${lineEndY - arrowHeadHeight - arrowOffset}`,
                p2: `${lineEndX + arrowHeadWidth / 2},${lineEndY - arrowHeadHeight - arrowOffset}`,
                p3: `${lineEndX},${lineEndY - arrowOffset}`,
            };

            break;
        //
        case NOCLinkName.NOC0_EAST_OUT:
            // right out
            lineStartX = NOC_CENTER.x + NOC_0_X_OFFSET;
            lineEndX = NODE_SIZE;
            lineStartY = NOC_CENTER.y + NOC_0_Y_OFFSET;
            lineEndY = NOC_CENTER.y + NOC_0_Y_OFFSET;
            arrow = {
                p1: `${lineEndX - arrowHeadHeight - arrowOffset},${lineEndY - arrowHeadWidth / 2}`,
                p2: `${lineEndX - arrowHeadHeight - arrowOffset},${lineEndY + arrowHeadWidth / 2}`,
                p3: `${lineEndX - arrowOffset},${lineEndY}`,
            };
            break;
        case NOCLinkName.NOC0_WEST_IN:
            // right in
            lineStartX = 0;
            lineEndX = NOC_CENTER.x + NOC_0_X_OFFSET;
            lineStartY = NOC_CENTER.y + NOC_0_Y_OFFSET;
            lineEndY = NOC_CENTER.y + NOC_0_Y_OFFSET;
            arrow = {
                p1: `${lineEndX - arrowHeadHeight - arrowOffset},${lineEndY - arrowHeadWidth / 2}`,
                p2: `${lineEndX - arrowHeadHeight - arrowOffset},${lineEndY + arrowHeadWidth / 2}`,
                p3: `${lineEndX - arrowOffset},${lineEndY}`,
            };
            break;

        case NOCLinkName.NOC0_IN:
            if (renderType === LinkRenderType.GRID) {
                arrowOffset = -10;
                lineStartX = NOC_CENTER.x + NOC_0_X_OFFSET - CORE_DISPERSION;
                lineEndX = CORE_CENTER.x + NOC_0_X_OFFSET - CORE_DISPERSION;
                lineStartY = NOC_CENTER.y + NOC_0_Y_OFFSET - CORE_DISPERSION;
                lineEndY = CORE_CENTER.y + NOC_0_Y_OFFSET - CORE_DISPERSION;
                arrow = {
                    p1: `${lineEndX - arrowHeadWidth / 2},${lineEndY + arrowHeadHeight - arrowOffset}`,
                    p2: `${lineEndX + arrowHeadWidth / 2},${lineEndY + arrowHeadHeight - arrowOffset}`,
                    p3: `${lineEndX},${lineEndY - arrowOffset}`,
                };
                angle = (Math.atan2(lineEndY - lineStartY, lineEndX - lineStartX) * 180) / Math.PI + 90;

                transform = `rotate(${angle} ${lineEndX} ${lineEndY})`;
            } else {
                lineStartX = NOC_CENTER.x + NOC_0_X_OFFSET * 2;
                lineEndX = NOC_CENTER.x + NOC_0_X_OFFSET * 2;
                lineStartY = 0;
                lineEndY = NOC_CENTER.y + NOC_1_Y_OFFSET;
                arrow = {
                    p1: `${lineEndX - arrowHeadWidth / 2},${lineEndY - arrowHeadHeight - arrowOffset}`,
                    p2: `${lineEndX + arrowHeadWidth / 2},${lineEndY - arrowHeadHeight - arrowOffset}`,
                    p3: `${lineEndX},${lineEndY - arrowOffset}`,
                };

            }
            break;
        case NOCLinkName.NOC0_OUT:
            if (renderType === LinkRenderType.GRID) {
                arrowOffset = -10;
                lineStartX = CORE_CENTER.x + NOC_0_X_OFFSET + CORE_DISPERSION;
                lineEndX = NOC_CENTER.x + NOC_0_X_OFFSET + CORE_DISPERSION;
                lineEndY = NOC_CENTER.y + NOC_0_Y_OFFSET + CORE_DISPERSION;
                lineStartY = CORE_CENTER.y + NOC_0_Y_OFFSET + CORE_DISPERSION;
                arrow = {
                    p1: `${lineEndX - arrowHeadWidth / 2},${lineEndY + arrowHeadHeight - arrowOffset}`,
                    p2: `${lineEndX + arrowHeadWidth / 2},${lineEndY + arrowHeadHeight - arrowOffset}`,
                    p3: `${lineEndX},${lineEndY - arrowOffset}`,
                };
                angle = (Math.atan2(lineEndY - lineStartY, lineEndX - lineStartX) * 180) / Math.PI + 90;

                transform = `rotate(${angle} ${lineEndX} ${lineEndY})`;
            } else {
                arrowOffset = 5;
                lineStartX = NOC_CENTER.x + NOC_1_X_OFFSET * 2;
                lineStartY = NOC_CENTER.y + NOC_1_Y_OFFSET;
                lineEndX = NOC_CENTER.x + NOC_1_X_OFFSET * 2;
                lineEndY = 0;
                arrow = {
                    p1: `${lineEndX - arrowHeadWidth / 2},${lineEndY + arrowHeadHeight + arrowOffset}`,
                    p2: `${lineEndX + arrowHeadWidth / 2},${lineEndY + arrowHeadHeight + arrowOffset}`,
                    p3: `${lineEndX},${lineEndY + arrowOffset}`,
                };
            }
            break;

        case NOCLinkName.NOC1_IN:
            if (renderType === LinkRenderType.GRID) {
                arrowOffset = -10;
                lineStartX = NOC_CENTER.x + NOC_1_X_OFFSET - CORE_DISPERSION;
                lineEndX = CORE_CENTER.x + NOC_1_X_OFFSET - CORE_DISPERSION;
                lineStartY = NOC_CENTER.y + NOC_1_Y_OFFSET - CORE_DISPERSION;
                lineEndY = CORE_CENTER.y + NOC_1_Y_OFFSET - CORE_DISPERSION;
                arrow = {
                    p1: `${lineEndX - arrowHeadWidth / 2},${lineEndY + arrowHeadHeight - arrowOffset}`,
                    p2: `${lineEndX + arrowHeadWidth / 2},${lineEndY + arrowHeadHeight - arrowOffset}`,
                    p3: `${lineEndX},${lineEndY - arrowOffset}`,
                };
                angle = (Math.atan2(lineEndY - lineStartY, lineEndX - lineStartX) * 180) / Math.PI + 90;

                transform = `rotate(${angle} ${lineEndX} ${lineEndY})`;
            } else {
                lineStartX = NOC_CENTER.x + NOC_0_X_OFFSET * 2;
                lineEndX = NOC_CENTER.x + NOC_0_X_OFFSET * 2;
                lineStartY = 0;
                lineEndY = NOC_CENTER.y + NOC_1_Y_OFFSET;
                arrow = {
                    p1: `${lineEndX - arrowHeadWidth / 2},${lineEndY - arrowHeadHeight - arrowOffset}`,
                    p2: `${lineEndX + arrowHeadWidth / 2},${lineEndY - arrowHeadHeight - arrowOffset}`,
                    p3: `${lineEndX},${lineEndY - arrowOffset}`,
                };

            }
            break;
        case NOCLinkName.NOC1_OUT:
            if (renderType === LinkRenderType.GRID) {
                arrowOffset = -10;

                lineStartX = CORE_CENTER.x + NOC_1_X_OFFSET + CORE_DISPERSION;
                lineEndX = NOC_CENTER.x + NOC_1_X_OFFSET + CORE_DISPERSION;
                lineEndY = NOC_CENTER.y + NOC_1_Y_OFFSET + CORE_DISPERSION;
                lineStartY = CORE_CENTER.y + NOC_1_Y_OFFSET + CORE_DISPERSION;
                arrow = {
                    p1: `${lineEndX - arrowHeadWidth / 2},${lineEndY + arrowHeadHeight - arrowOffset}`,
                    p2: `${lineEndX + arrowHeadWidth / 2},${lineEndY + arrowHeadHeight - arrowOffset}`,
                    p3: `${lineEndX},${lineEndY - arrowOffset}`,
                };
                angle = (Math.atan2(lineEndY - lineStartY, lineEndX - lineStartX) * 180) / Math.PI + 90;

                transform = `rotate(${angle} ${lineEndX} ${lineEndY})`;
            } else {
                arrowOffset = 5;
                lineStartX = NOC_CENTER.x + NOC_1_X_OFFSET * 2;
                lineStartY = NOC_CENTER.y + NOC_1_Y_OFFSET;
                lineEndX = NOC_CENTER.x + NOC_1_X_OFFSET * 2;
                lineEndY = 0;
                arrow = {
                    p1: `${lineEndX - arrowHeadWidth / 2},${lineEndY + arrowHeadHeight + arrowOffset}`,
                    p2: `${lineEndX + arrowHeadWidth / 2},${lineEndY + arrowHeadHeight + arrowOffset}`,
                    p3: `${lineEndX},${lineEndY + arrowOffset}`,
                };
            }
            break;

        case DramBankLinkName.DRAM_INOUT:
        case DramBankLinkName.DRAM0_INOUT:
        case DramBankLinkName.DRAM1_INOUT:
        case DramNOCLinkName.NOC0_NOC2AXI:
        case DramNOCLinkName.NOC1_NOC2AXI:
            arrowOffset = 5;
            lineStartX = NOC_CENTER.x + NOC_1_X_OFFSET;
            lineStartY = NOC_CENTER.y + NOC_1_Y_OFFSET;
            lineEndX = NOC_CENTER.x + NOC_1_X_OFFSET;
            lineEndY = 0;
            arrow = {
                p1: `${lineEndX - arrowHeadWidth / 2},${lineEndY + arrowHeadHeight + arrowOffset}`,
                p2: `${lineEndX + arrowHeadWidth / 2},${lineEndY + arrowHeadHeight + arrowOffset}`,
                p3: `${lineEndX},${lineEndY + arrowOffset}`,
            };

            arrowSecondary = {
                p1: `${lineStartX - arrowHeadWidth / 2},${lineStartY - arrowHeadHeight - arrowOffset}`,
                p2: `${lineStartX + arrowHeadWidth / 2},${lineStartY - arrowHeadHeight - arrowOffset}`,
                p3: `${lineStartX},${lineStartY - arrowOffset}`,
            };

            break;
        default:
            console.info('Unknown link type', linkName);
            break;
    }
    return { lineEndX, lineEndY, lineStartX, lineStartY, arrow, arrowSecondary, transform };
};

export const drawPipesDirect = (
    svg: d3.Selection<SVGSVGElement | null, unknown, null, undefined>,
    linkName: NetworkLinkName,
    pipeIds: string[],
    rendererType: LinkRenderType = LinkRenderType.GRID,
) => {
    const {
        //
        lineEndX,
        lineEndY,
        lineStartX,
        lineStartY,
        arrow,
        arrowSecondary,
        transform,
    } = getLinkPoints(linkName, rendererType);

    const strokeLength = 5;

    if (pipeIds.length) {
        if (
            linkName !== NOCLinkName.NOC1_SOUTH_IN &&
            linkName !== NOCLinkName.NOC0_WEST_IN &&
            linkName !== NOCLinkName.NOC0_SOUTH_OUT &&
            linkName !== NOCLinkName.NOC1_WEST_OUT
        ) {
            svg
                // only draw arrows for long links
                .append('polygon')
                .attr('points', `${arrow.p1} ${arrow.p2} ${arrow.p3}`)
                .attr('transform', transform)
                .attr('fill', '#9e9e9e');
        }
        if (linkName === DramNOCLinkName.NOC0_NOC2AXI || DramNOCLinkName.NOC1_NOC2AXI || DramBankLinkName.DRAM_INOUT) {
            svg
                //
                .append('polygon')
                .attr('points', `${arrowSecondary.p1} ${arrowSecondary.p2} ${arrowSecondary.p3}`)
                .attr('transform', transform)
                .attr('fill', '#9e9e9e');
        }
    }
    const dashArray = [strokeLength, (pipeIds.length - 1) * strokeLength];
    pipeIds.forEach((pipeId: string, index: number) => {
        svg.append('line')
            // keep prettier at bay
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

export const drawSelections = (
    svg: d3.Selection<SVGSVGElement | null, unknown, null, undefined>,
    nocLinkName: NOCLinkName,
    node: ComputeNode,
    selectedPipeIds: string[],
) => {
    const nodePipeIds = node.getPipesForDirection(nocLinkName);
    const pipeIds = nodePipeIds.filter((pipeId) => selectedPipeIds.includes(pipeId));
    drawPipesDirect(svg, nocLinkName, pipeIds);
    return pipeIds.length;
};

export const drawNOC = (
    svg: d3.Selection<SVGSVGElement | null, unknown, null, undefined>,
    point: { x: number; y: number },
) => {
    svg.append('circle')
        //
        .attr('cx', point.x)
        .attr('cy', point.y)
        .attr('r', 4)
        .attr('stroke-width', 2)
        .attr('fill', '#9e9e9e')
        .attr('stroke', '#9e9e9e');
};

export const calculateLinkCongestionColor = (value: number, min: number = 0, isHC: boolean = false): string => {
    const max = 120;
    const normalizedVal = Math.min(value, max);
    const ratio = (normalizedVal - min) / (max - min);
    const intensity = Math.round(ratio * 255);
    if (isHC) {
        return `rgb(${intensity},${intensity},${255 - intensity})`;
    }

    return `rgb(${intensity}, ${255 - intensity}, 0)`;
};

export const getDramGroupingStyles = (border: { left: boolean; right: boolean; top: boolean; bottom: boolean }): {} => {
    const color = 'rgba(248,226,112,.25)';
    const gradientColor = 'rgba(248,226,112,0.2)';
    let dramStyles = {};
    dramStyles = { borderColor: color };
    const borderSize = 2;
    if (border.left) {
        dramStyles = { ...dramStyles, borderLeft: `${borderSize}px solid ${color}` };
    }
    if (border.right) {
        dramStyles = { ...dramStyles, borderRight: `${borderSize}px solid ${color}` };
    }
    if (border.top) {
        dramStyles = { ...dramStyles, borderTop: `${borderSize}px solid ${color}` };
    }
    if (border.bottom) {
        dramStyles = { ...dramStyles, borderBottom: `${borderSize}px solid ${color}` };
    }
    const gradientSize = 6;
    const gradient = `repeating-linear-gradient(45deg, ${gradientColor}, ${gradientColor} ${gradientSize}px, transparent ${gradientSize}px, transparent ${
        gradientSize * 2
    }px)`;
    return { ...dramStyles, background: gradient };
};

export const getNodeOpStyles = (
    styles: {},
    color: string | undefined,
    border: { left: boolean; right: boolean; top: boolean; bottom: boolean },
): {} => {
    const borderSize = 2;
    if (border.left) {
        styles = { ...styles, borderLeft: `${borderSize}px solid ${color}` };
    }
    if (border.right) {
        styles = { ...styles, borderRight: `${borderSize}px solid ${color}` };
    }
    if (border.top) {
        styles = { ...styles, borderTop: `${borderSize}px solid ${color}` };
    }
    if (border.bottom) {
        styles = { ...styles, borderBottom: `${borderSize}px solid ${color}` };
    }

    const gradientColor = color?.replace(')', ', 0.25)').replace('rgb', 'rgba');
    const gradient = `repeating-linear-gradient(-45deg, ${gradientColor}, ${gradientColor} 3px, transparent 3px, transparent 6px)`;

    return { ...styles, background: gradient };
};
