import React, { useRef } from 'react';
import * as d3 from 'd3';
import { useSelector } from 'react-redux';
import { NetworkLink, NOCLink } from '../../../data/Chip';
import { calculateLinkCongestionColor, drawLink, drawPipesDirect, LinkRenderType } from '../../../utils/DrawingAPI';
import { RootState } from '../../../data/store';
import { PipeSelection } from '../../../data/StateTypes';
import { DramBankLinkName, DramNOCLinkName, NetworkLinkName, NOC, NOCLinkName } from '../../../data/Types';

type DetailedViewPipeRendererProps = {
    links: NetworkLink[];
    className?: string;
    showLinkSaturation: boolean;
    linkSaturationTreshold: number;
};

const DetailedViewPipeRenderer: React.FC<DetailedViewPipeRendererProps> = ({
    links,
    showLinkSaturation,
    linkSaturationTreshold,
    className,
}) => {
    const svgRef = useRef<SVGSVGElement | null>(null);
    const allPipes = useSelector((state: RootState) => state.pipeSelection.pipes);
    const isHighContrast = useSelector((state: RootState) => state.highContrast.enabled);
    const linksData = useSelector((state: RootState) => state.linkSaturation.links);
    const validLinkIds = [
        NOCLinkName.NOC0_IN,
        NOCLinkName.NOC1_IN,
        NOCLinkName.NOC0_OUT,
        NOCLinkName.NOC1_OUT,
        DramNOCLinkName.NOC0_NOC2AXI,
        DramNOCLinkName.NOC1_NOC2AXI,
        DramBankLinkName.DRAM_INOUT,
        DramBankLinkName.DRAM0_INOUT,
        DramBankLinkName.DRAM1_INOUT,
    ];

    const linksNOCType: NetworkLinkName[] = [
        NOCLinkName.NOC0_IN,
        NOCLinkName.NOC1_IN,
        NOCLinkName.NOC0_OUT,
        NOCLinkName.NOC1_OUT,
        DramNOCLinkName.NOC0_NOC2AXI,
        DramNOCLinkName.NOC1_NOC2AXI,
    ];

    const noc0Saturation = useSelector((state: RootState) => state.linkSaturation.showNOC0);
    const noc1Saturation = useSelector((state: RootState) => state.linkSaturation.showNOC1);

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const drawCongestion = (link: NetworkLink, linkName: NetworkLinkName) => {
        if (showLinkSaturation) {
            let renderCongestion: boolean = false;
            if (!linksNOCType.includes(linkName)) {
                renderCongestion = true;
            } else if (linksNOCType.includes(linkName)) {
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

        const validPipes = link.pipes.map((pipeSegment) => pipeSegment.id).filter((pipeId) => selectedPipeIds.includes(pipeId));

        const { name } = link;
        if (name && validLinkIds.includes(name as NOCLinkName | DramNOCLinkName)) {
            drawCongestion(link, link.name);
            drawPipesDirect(svg, link.name, validPipes, LinkRenderType.DETAILED_VIEW);
        }
    });
    return (
        <div className='pipe-renderer'>
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
