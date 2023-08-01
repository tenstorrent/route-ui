import React, {useEffect, useRef} from 'react';
import * as d3 from 'd3';
import {DramID, GenericNOCLink, LinkID} from '../../../data/DataStructures';
import {drawPipesDirect} from '../../../utils/DrawingAPI';

type PipeRendererProps = {
    links: GenericNOCLink[];
    className?: string;
};

const PipeRenderer: React.FC<PipeRendererProps> = ({links, className}) => {
    const svgRef = useRef<SVGSVGElement | null>(null);
    useEffect(() => {
        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();
        links.forEach((link) => {
            const {id} = link;
            // eslint-disable-next-line default-case
            switch (id) {
                case LinkID.NOC0_IN:
                case LinkID.NOC1_IN:
                    drawPipesDirect(
                        svg,
                        DramID.NOC_IN,
                        link.pipes.map((pipe) => pipe.id)
                    );
                    break;
                case LinkID.NOC0_OUT:
                case LinkID.NOC1_OUT:
                    drawPipesDirect(
                        svg,
                        DramID.NOC_OUT,
                        link.pipes.map((pipe) => pipe.id)
                    );
                    break;
                case DramID.NOC0_NOC2AXI:
                case DramID.NOC1_NOC2AXI:
                    drawPipesDirect(
                        svg,
                        id,
                        link.pipes.map((pipe) => pipe.id)
                    );
                    break;
                case DramID.DRAM_INOUT:
                case DramID.DRAM0_INOUT:
                case DramID.DRAM1_INOUT:
                    drawPipesDirect(
                        svg,
                        DramID.DRAM_INOUT,
                        link.pipes.map((pipe) => pipe.id)
                    );
                    break;
            }
        });
    }, [svgRef, links]);
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
export default PipeRenderer;
