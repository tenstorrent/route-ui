import React, {useEffect, useRef} from 'react';
import * as d3 from 'd3';
import {useSelector} from 'react-redux';
import {GenericNOCLink} from '../../../data/DataStructures';
import {calculateLinkCongestionColor, drawLink, drawPipesDirect} from '../../../utils/DrawingAPI';
import {RootState} from '../../../data/store';
import {PipeSelection} from '../../../data/StateTypes';
import {DramName, LinkName} from '../../../data/Types';

type PipeRendererProps = {
    links: GenericNOCLink[];
    className?: string;
    showLinkSaturation: boolean;
    linkSaturationTreshold: number;
};

const PipeRenderer: React.FC<PipeRendererProps> = ({links, showLinkSaturation, linkSaturationTreshold, className}) => {
    const svgRef = useRef<SVGSVGElement | null>(null);
    const allPipes = useSelector((state: RootState) => state.pipeSelection.pipes);
    const isHighContrast = useSelector((state: RootState) => state.highContrast.enabled);

    const linksData = useSelector((state: RootState) => state.linkSaturation.links);
    const validLinkIds = [
        LinkName.NOC0_IN,
        LinkName.NOC1_IN,
        LinkName.NOC0_OUT,
        LinkName.NOC1_OUT,
        DramName.NOC0_NOC2AXI,
        DramName.NOC1_NOC2AXI,
        DramName.DRAM_INOUT,
        DramName.DRAM0_INOUT,
        DramName.DRAM1_INOUT,
    ];

    useEffect(() => {
        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const drawCongestion = (link: GenericNOCLink, id: DramName | LinkName) => {
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

            const {name} = link;
            if (name && validLinkIds.includes(name as LinkName | DramName)) {
                switch (name) {
                    case LinkName.NOC0_IN:
                    case LinkName.NOC1_IN:
                        drawCongestion(link, DramName.NOC_IN);
                        drawPipesDirect(svg, DramName.NOC_IN, validPipes);
                        break;
                    case LinkName.NOC0_OUT:
                    case LinkName.NOC1_OUT:
                        drawCongestion(link, DramName.NOC_OUT);
                        drawPipesDirect(svg, DramName.NOC_OUT, validPipes);
                        break;
                    case DramName.NOC0_NOC2AXI:
                    case DramName.NOC1_NOC2AXI:
                        drawCongestion(link, name);
                        drawPipesDirect(svg, name, validPipes);
                        break;
                    case DramName.DRAM_INOUT:
                    case DramName.DRAM0_INOUT:
                    case DramName.DRAM1_INOUT:
                        drawCongestion(link, DramName.DRAM_INOUT);
                        drawPipesDirect(svg, DramName.DRAM_INOUT, validPipes);
                        break;
                    default:
                        break;
                }
            }
        });
    }, [svgRef, links, allPipes, isHighContrast]);
    return (
        <div className="pipe-renderer">
            {/* DEBUGGING CODE BELOW */}
            {/* {links.map((link) => ( */}
            {/*    <div style={{color: '#fff'}} key={link.id}> */}
            {/*        {link.id} - {link.numOccupants} */}
            {/*        {link.pipes.map((pipe) => ( */}
            {/*            <div key={pipe.id}>{pipe.id}</div> */}
            {/*        ))} */}
            {/*    </div> */}
            {/* ))} */}
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={`svg ${className}`} ref={svgRef} />
        </div>
    );
};
PipeRenderer.defaultProps = {
    className: '',
};
export default PipeRenderer;
