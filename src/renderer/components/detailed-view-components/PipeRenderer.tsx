import React, {useEffect, useRef} from 'react';
import * as d3 from 'd3';
import {useSelector} from 'react-redux';
import {DramID, GenericNOCLink, LinkID} from '../../../data/DataStructures';
import {drawPipesDirect} from '../../../utils/DrawingAPI';
import {PipeSelection, RootState} from '../../../data/store';

type PipeRendererProps = {
    links: GenericNOCLink[];
    className?: string;
};

const PipeRenderer: React.FC<PipeRendererProps> = ({links, className}) => {
    const svgRef = useRef<SVGSVGElement | null>(null);
    const allPipes = useSelector((state: RootState) => state.pipeSelection.pipes);

    useEffect(() => {
        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        links.forEach((link) => {
            // const list = link.pipes.filter((pipe: PipeSelection) => pipe.selected)
            //     .map((pipe: PipeSelection) => pipe.id);

            const selectedPipeIds = Object.values(allPipes)
                .filter((pipe: PipeSelection) => pipe.selected)
                .map((pipe: PipeSelection) => pipe.id);

            const validPipes = link.pipes.map((pipe) => pipe.id).filter((pipeId) => selectedPipeIds.includes(pipeId));

            const {id} = link;
            // eslint-disable-next-line default-case
            switch (id) {
                case LinkID.NOC0_IN:
                case LinkID.NOC1_IN:
                    drawPipesDirect(
                        svg,
                        DramID.NOC_IN,
                        validPipes
                        // link.pipes.map((pipe) => pipe.id)
                    );
                    break;
                case LinkID.NOC0_OUT:
                case LinkID.NOC1_OUT:
                    drawPipesDirect(
                        svg,
                        DramID.NOC_OUT,
                        validPipes
                        // link.pipes.map((pipe) => pipe.id)
                    );
                    break;
                case DramID.NOC0_NOC2AXI:
                case DramID.NOC1_NOC2AXI:
                    drawPipesDirect(svg, id, validPipes);
                    break;
                case DramID.DRAM_INOUT:
                case DramID.DRAM0_INOUT:
                case DramID.DRAM1_INOUT:
                    drawPipesDirect(svg, DramID.DRAM_INOUT, validPipes);
                    break;
            }
        });
    }, [svgRef, links, allPipes]);
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
