import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useSelector } from 'react-redux';
import { NetworkLink } from '../../../data/Chip';
import { calculateLinkCongestionColor, drawLink, drawPipesDirect } from '../../../utils/DrawingAPI';
import { RootState } from '../../../data/store';
import { PipeSelection } from '../../../data/StateTypes';
import { DramBankLinkName, DramNOCLinkName, NetworkLinkName, NOCLinkName } from '../../../data/Types';

type PipeRendererProps = {
    links: NetworkLink[];
    className?: string;
    showLinkSaturation: boolean;
    linkSaturationTreshold: number;
};

const PipeRenderer: React.FC<PipeRendererProps> = ({
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

    useEffect(() => {
        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const drawCongestion = (link: NetworkLink, id: NetworkLinkName) => {
            if (showLinkSaturation) {
                const linkData = linksData[link.uid];
                if (linkData?.saturation >= linkSaturationTreshold) {
                    drawLink(svg, id, calculateLinkCongestionColor(linkData.saturation, 0, isHighContrast), 5);
                }
            }
        };
        links.forEach((link) => {
            const selectedPipeIds = Object.values(allPipes)
                .filter((pipe: PipeSelection) => pipe.selected)
                .map((pipe: PipeSelection) => pipe.id);

            const validPipes = link.pipes.map((pipe) => pipe.id).filter((pipeId) => selectedPipeIds.includes(pipeId));

            const { name } = link;
            if (name && validLinkIds.includes(name as NOCLinkName | DramNOCLinkName)) {
                switch (name) {
                    case NOCLinkName.NOC0_IN:
                    case NOCLinkName.NOC1_IN:
                        drawCongestion(link, DramNOCLinkName.NOC_IN);
                        drawPipesDirect(svg, DramNOCLinkName.NOC_IN, validPipes);
                        break;
                    case NOCLinkName.NOC0_OUT:
                    case NOCLinkName.NOC1_OUT:
                        drawCongestion(link, DramNOCLinkName.NOC_OUT);
                        drawPipesDirect(svg, DramNOCLinkName.NOC_OUT, validPipes);
                        break;
                    case DramNOCLinkName.NOC0_NOC2AXI:
                    case DramNOCLinkName.NOC1_NOC2AXI:
                        drawCongestion(link, name);
                        drawPipesDirect(svg, name, validPipes);
                        break;
                    case DramBankLinkName.DRAM_INOUT:
                    case DramBankLinkName.DRAM0_INOUT:
                    case DramBankLinkName.DRAM1_INOUT:
                        drawCongestion(link, DramBankLinkName.DRAM_INOUT);
                        drawPipesDirect(svg, DramBankLinkName.DRAM_INOUT, validPipes);
                        break;
                    default:
                        break;
                }
            }
        });
    }, [svgRef, links, allPipes, isHighContrast]);
    return (
        <div className='pipe-renderer'>
            {/* DEBUGGING CODE BELOW */}
            {/* {links.map((link) => ( */}
            {/*    <div style={{color: '#fff'}} key={link.id}> */}
            {/*        {link.id} - {link.numOccupants} */}
            {/*        {link.pipes.map((pipe) => ( */}
            {/*            <div key={pipe.id}>{pipe.id}</div> */}
            {/*        ))} */}
            {/*    </div> */}
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
PipeRenderer.defaultProps = {
    className: '',
};
export default PipeRenderer;
