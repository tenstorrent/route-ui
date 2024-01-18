import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useSelector } from 'react-redux';
import { RootState } from 'data/store/createStore';
import { getHighContrastState } from 'data/store/selectors/uiState.selectors';

import { NetworkLink, NOCLink } from '../../../data/Chip';
import { calculateLinkCongestionColor, drawLink, drawPipesDirect, LinkRenderType } from '../../../utils/DrawingAPI';
import { PipeSelection } from '../../../data/StateTypes';
import {
    DramBankLinkName,
    NOC2AXILinkName,
    EthernetLinkName,
    NetworkLinkName,
    NOC,
    NOCLinkName,
    PCIeLinkName,
} from '../../../data/Types';

type DetailedViewPipeRendererProps = {
    links: NetworkLink[];
    className?: string;
};

const DetailedViewPipeRenderer: React.FC<DetailedViewPipeRendererProps> = ({ links, className }) => {
    const svgRef = useRef<SVGSVGElement | null>(null);
    const showLinkSaturation = useSelector((state: RootState) => state.linkSaturation.showLinkSaturation);
    const linkSaturationTreshold = useSelector((state: RootState) => state.linkSaturation.linkSaturationTreshold);
    const allPipes = useSelector((state: RootState) => state.pipeSelection.pipes);
    const isHighContrast = useSelector(getHighContrastState);
    const linksData = useSelector((state: RootState) => state.linkSaturation.links);
    const noc0Saturation = useSelector((state: RootState) => state.linkSaturation.showLinkSaturationNOC0);
    const noc1Saturation = useSelector((state: RootState) => state.linkSaturation.showLinkSaturationNOC1);

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
            const selectedPipeIds = Object.values(allPipes)
                .filter((pipeSegment: PipeSelection) => pipeSegment.selected)
                .map((pipeSegment: PipeSelection) => pipeSegment.id);

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
        allPipes,
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
                width='80'
                height='80'
                viewBox='0 0 80 80'
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
