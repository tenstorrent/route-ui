/**
 * SPDX-License-Identifier: Apache-2.0
 * SPDX-FileCopyrightText: © 2024 Tenstorrent Inc.
 */

import * as d3 from 'd3';
import { getHighContrastState } from 'data/store/selectors/uiState.selectors';
import React, { useContext, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';

import { NOCLink, NetworkLink } from '../../../data/GraphOnChip';
import { GraphOnChipContext } from '../../../data/GraphOnChipContext';
import {
    DramBankLinkName,
    EthernetLinkName,
    NOC,
    NOC2AXILinkName,
    NOCLinkName,
    NetworkLinkName,
    PCIeLinkName,
} from '../../../data/Types';
import {
    getAllLinksForGraph,
    getLinkSaturation,
    getShowLinkSaturation,
    getShowNOC0,
    getShowNOC1,
} from '../../../data/store/selectors/linkSaturation.selectors';
import { getSelectedPipesIds } from '../../../data/store/selectors/pipeSelection.selectors';
import { LinkRenderType, calculateLinkCongestionColor, drawLink, drawPipesDirect } from '../../../utils/DrawingAPI';

type DetailedViewPipeRendererProps = {
    links: NetworkLink[];
    className?: string;
    size?: number;
};

const DetailedViewPipeRenderer: React.FC<DetailedViewPipeRendererProps> = ({ links, className, size = 80 }) => {
    const svgRef = useRef<SVGSVGElement | null>(null);
    const showLinkSaturation = useSelector(getShowLinkSaturation);
    const linkSaturationTreshold = useSelector(getLinkSaturation);
    const graphName = useContext(GraphOnChipContext).getActiveGraphName();
    const selectedPipeIds = useSelector(getSelectedPipesIds);
    const isHighContrast = useSelector(getHighContrastState);
    const linksData = useSelector(getAllLinksForGraph(graphName));
    const noc0Saturation = useSelector(getShowNOC0);
    const noc1Saturation = useSelector(getShowNOC1);

    // TODO: see if useLayoutEffect is better in a future
    useEffect(() => {
        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();
        const drawCongestion = (link: NetworkLink, linkName: NetworkLinkName) => {
            if (showLinkSaturation) {
                let renderCongestion: boolean = false;
                if (!NOC_LINK_NAMES.includes(linkName)) {
                    renderCongestion = true;
                } else if (NOC_LINK_NAMES.includes(linkName)) {
                    if ((link as NOCLink).noc === NOC.NOC0 && noc0Saturation) {
                        renderCongestion = true;
                    }
                    if ((link as NOCLink).noc === NOC.NOC1 && noc1Saturation) {
                        renderCongestion = true;
                    }
                }
                if (renderCongestion) {
                    const linkData = linksData[link.uid];
                    if (linkData?.saturation >= linkSaturationTreshold) {
                        drawLink(
                            svg,
                            linkName,
                            calculateLinkCongestionColor(linkData.saturation, 0, isHighContrast),
                            5,
                            LinkRenderType.DETAILED_VIEW,
                        );
                    }
                }
            }
        };

        links.forEach((link) => {
            const validPipes = link.pipes
                .map((pipeSegment) => pipeSegment.id)
                .filter((pipeId) => selectedPipeIds.includes(pipeId));

            const { name } = link;
            if (name && LINK_NAMES.includes(name as NetworkLinkName)) {
                drawCongestion(link, link.name);
                drawPipesDirect(svg, link.name, validPipes, LinkRenderType.DETAILED_VIEW);
            }
        });
    }, [
        svgRef,
        links,
        showLinkSaturation,
        linkSaturationTreshold,
        linksData,
        noc0Saturation,
        noc1Saturation,
        isHighContrast,
    ]);

    const linkNames = links.map((link) => link.name).join(' ');
    return (
        <div className='pipe-renderer' data-links={linkNames}>
            {/* DEBUGGING CODE BELOW */}
            {/* {links.map((link) => ( */}
            {/*   <div style={{color: '#fff'}} key={link.name}> */}
            {/*       {link.name} - {link.numOccupants} */}
            {/*       {link.pipes.map((pipeSegment) => ( */}
            {/*           <div key={pipeSegment.id}>{pipeSegment.id}</div> */}
            {/*       ))} */}
            {/*   </div> */}
            {/* ))} */}
            <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
                className={`svg ${className}`}
                ref={svgRef}
            />
        </div>
    );
};
DetailedViewPipeRenderer.defaultProps = {
    className: '',
};
export default DetailedViewPipeRenderer;

const LINK_NAMES = [
    NOCLinkName.NOC0_IN,
    NOCLinkName.NOC1_IN,
    NOCLinkName.NOC0_OUT,
    NOCLinkName.NOC1_OUT,
    NOC2AXILinkName.NOC0_NOC2AXI,
    NOC2AXILinkName.NOC1_NOC2AXI,
    DramBankLinkName.DRAM_INOUT,
    DramBankLinkName.DRAM0_INOUT,
    DramBankLinkName.DRAM1_INOUT,
    EthernetLinkName.ETH_IN,
    EthernetLinkName.ETH_OUT,
    PCIeLinkName.PCIE_INOUT,
];

const NOC_LINK_NAMES: NetworkLinkName[] = [
    NOCLinkName.NOC0_IN,
    NOCLinkName.NOC1_IN,
    NOCLinkName.NOC0_OUT,
    NOCLinkName.NOC1_OUT,
    NOC2AXILinkName.NOC0_NOC2AXI,
    NOC2AXILinkName.NOC1_NOC2AXI,
];
