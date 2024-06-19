// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent AI ULC

import * as d3 from 'd3';
import { FC, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { ComputeNode } from '../../../data/GraphOnChip';
import { NOC, NOCLinkName } from '../../../data/Types';
import { getLinkSaturation, getShowNOC0, getShowNOC1 } from '../../../data/store/selectors/linkSaturation.selectors';
import { getFocusPipe, getSelectedPipesIds } from '../../../data/store/selectors/pipeSelection.selectors';
import { getShowEmptyLinks } from '../../../data/store/selectors/uiState.selectors';
import {
    NOC_CONFIGURATION,
    NODE_SIZE,
    calculateLinkCongestionColor,
    drawLink,
    drawNOCRouter,
    drawSelections,
} from '../../../utils/DrawingAPI';
import type { LinkState } from '../../../data/StateTypes';

interface NodePipeRendererProps {
    node: ComputeNode;
    linksData: Record<string, LinkState>;
    isHighContrast: boolean;
    showLinkSaturation: boolean;
}

const NodePipeRenderer: FC<NodePipeRendererProps> = ({ node, linksData, isHighContrast, showLinkSaturation }) => {
    const focusPipe = useSelector(getFocusPipe);
    const selectedPipeIds = useSelector(getSelectedPipesIds);

    const svgRef = useRef<SVGSVGElement | null>(null);
    const svg = d3.select(svgRef.current);

    const linkSaturationTreshold = useSelector(getLinkSaturation);

    const noc0Saturation = useSelector(getShowNOC0);
    const noc1Saturation = useSelector(getShowNOC1);

    const showEmptyLinks = useSelector(getShowEmptyLinks);

    svg.selectAll('*').remove();

    useEffect(() => {
        if (showEmptyLinks) {
            drawLink(svg, NOCLinkName.NOC1_NORTH_OUT);
            drawLink(svg, NOCLinkName.NOC0_NORTH_IN);
            drawLink(svg, NOCLinkName.NOC1_SOUTH_IN);
            drawLink(svg, NOCLinkName.NOC0_SOUTH_OUT);
            drawLink(svg, NOCLinkName.NOC1_EAST_IN);
            drawLink(svg, NOCLinkName.NOC0_EAST_OUT);
            drawLink(svg, NOCLinkName.NOC0_WEST_IN);
            drawLink(svg, NOCLinkName.NOC1_WEST_OUT);
            drawLink(svg, NOCLinkName.NOC1_OUT);
            drawLink(svg, NOCLinkName.NOC0_OUT);
            drawLink(svg, NOCLinkName.NOC0_IN);
            drawLink(svg, NOCLinkName.NOC1_IN);
        }
    }, [showEmptyLinks, svg]);

    useEffect(() => {
        if (showLinkSaturation) {
            node.nocLinks.forEach((link) => {
                if ((link.noc === NOC.NOC0 && noc0Saturation) || (link.noc === NOC.NOC1 && noc1Saturation)) {
                    const linkStateData = linksData[link.uid];

                    if (linkStateData && linkStateData.saturation >= linkSaturationTreshold) {
                        const color = calculateLinkCongestionColor(linkStateData.saturation, 0, isHighContrast);
                        drawLink(svg, link.name, color, 5);
                    }
                }
            });
        }
    }, [
        showLinkSaturation,
        noc0Saturation,
        noc1Saturation,
        linkSaturationTreshold,
        linksData,
        node.nocLinks,
        svg,
        isHighContrast,
    ]);

    useEffect(() => {
        let noc0numPipes = 0;
        let noc1numPipes = 0;
        noc0numPipes += drawSelections(svg, NOCLinkName.NOC0_EAST_OUT, node, selectedPipeIds);
        noc0numPipes += drawSelections(svg, NOCLinkName.NOC0_WEST_IN, node, selectedPipeIds);
        noc0numPipes += drawSelections(svg, NOCLinkName.NOC0_SOUTH_OUT, node, selectedPipeIds);
        noc0numPipes += drawSelections(svg, NOCLinkName.NOC0_NORTH_IN, node, selectedPipeIds);
        noc0numPipes += drawSelections(svg, NOCLinkName.NOC0_IN, node, selectedPipeIds);
        noc0numPipes += drawSelections(svg, NOCLinkName.NOC0_OUT, node, selectedPipeIds);

        noc1numPipes += drawSelections(svg, NOCLinkName.NOC1_NORTH_OUT, node, selectedPipeIds);
        noc1numPipes += drawSelections(svg, NOCLinkName.NOC1_SOUTH_IN, node, selectedPipeIds);
        noc1numPipes += drawSelections(svg, NOCLinkName.NOC1_WEST_OUT, node, selectedPipeIds);
        noc1numPipes += drawSelections(svg, NOCLinkName.NOC1_EAST_IN, node, selectedPipeIds);
        noc1numPipes += drawSelections(svg, NOCLinkName.NOC1_IN, node, selectedPipeIds);
        noc1numPipes += drawSelections(svg, NOCLinkName.NOC1_OUT, node, selectedPipeIds);

        if (noc0numPipes > 0) {
            drawNOCRouter(svg, NOC_CONFIGURATION.noc0);
        }
        if (noc1numPipes > 0) {
            drawNOCRouter(svg, NOC_CONFIGURATION.noc1);
        }
    }, [node, selectedPipeIds, svg]);

    return (
        <svg
            className={`node-svg ${focusPipe !== null ? 'focus-mode' : ''}`}
            ref={svgRef}
            width={NODE_SIZE}
            height={NODE_SIZE}
        />
    );
};

export default NodePipeRenderer;
