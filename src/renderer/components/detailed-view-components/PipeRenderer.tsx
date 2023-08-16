import React, {useEffect, useRef} from 'react';
import * as d3 from 'd3';
import {useSelector} from 'react-redux';
import {DramID, GenericNOCLink, LinkID} from '../../../data/DataStructures';
import {calculateLinkCongestionColor, drawLink, drawPipesDirect} from '../../../utils/DrawingAPI';
import {PipeSelection, RootState} from '../../../data/store';

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

    const validLinkIds = [
        LinkID.NOC0_IN,
        LinkID.NOC1_IN,
        LinkID.NOC0_OUT,
        LinkID.NOC1_OUT,
        DramID.NOC0_NOC2AXI,
        DramID.NOC1_NOC2AXI,
        DramID.DRAM_INOUT,
        DramID.DRAM0_INOUT,
        DramID.DRAM1_INOUT,
    ];

    useEffect(() => {
        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const drawCongestion = (link: GenericNOCLink, id: DramID | LinkID) => {
            if (showLinkSaturation) {
                if (link.linkSaturation >= linkSaturationTreshold) {
                    drawLink(svg, id, calculateLinkCongestionColor(link.linkSaturation, 0, isHighContrast), 5);
                }
            }
        };
        links.forEach((link) => {
            const selectedPipeIds = Object.values(allPipes)
                .filter((pipe: PipeSelection) => pipe.selected)
                .map((pipe: PipeSelection) => pipe.id);

            const validPipes = link.pipes.map((pipe) => pipe.id).filter((pipeId) => selectedPipeIds.includes(pipeId));

            const {id} = link;
            if (id && validLinkIds.includes(id as LinkID | DramID)) {
                switch (id) {
                    case LinkID.NOC0_IN:
                    case LinkID.NOC1_IN:
                        drawCongestion(link, DramID.NOC_IN);
                        drawPipesDirect(svg, DramID.NOC_IN, validPipes);
                        break;
                    case LinkID.NOC0_OUT:
                    case LinkID.NOC1_OUT:
                        drawCongestion(link, DramID.NOC_OUT);
                        drawPipesDirect(svg, DramID.NOC_OUT, validPipes);
                        break;
                    case DramID.NOC0_NOC2AXI:
                    case DramID.NOC1_NOC2AXI:
                        drawCongestion(link, id);
                        drawPipesDirect(svg, id, validPipes);
                        break;
                    case DramID.DRAM_INOUT:
                    case DramID.DRAM0_INOUT:
                    case DramID.DRAM1_INOUT:
                        drawCongestion(link, DramID.DRAM_INOUT);
                        drawPipesDirect(svg, DramID.DRAM_INOUT, validPipes);
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
