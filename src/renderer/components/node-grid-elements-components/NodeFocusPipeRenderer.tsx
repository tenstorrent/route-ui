import { FC, useRef } from 'react';
import { useSelector } from 'react-redux';
import * as d3 from 'd3';
import { ComputeNode } from '../../../data/Chip';
import { RootState } from '../../../data/store/createStore';
import { NOCLinkName } from '../../../data/Types';
import { NODE_SIZE, drawSelections } from '../../../utils/DrawingAPI';

interface NodeFocusPipeRendererProps {
    node: ComputeNode;
}

export const NodeFocusPipeRenderer: FC<NodeFocusPipeRendererProps> = ({ node }) => {
    // TODO: note to future self this is working incidently, but once gridview starts being generated later or regenerated this will likely need a useEffect
    const svgRef = useRef<SVGSVGElement | null>(null);
    const svg = d3.select(svgRef.current);
    const focusPipe = useSelector((state: RootState) => state.pipeSelection.focusPipe);
    const focusedPipeIds = [focusPipe || ''];

    svg.selectAll('*').remove();
    if (focusPipe && node.pipes.filter((pipe) => pipe.id === focusPipe).length > 0) {
        drawSelections(svg, NOCLinkName.NOC0_EAST_OUT, node, focusedPipeIds);
        drawSelections(svg, NOCLinkName.NOC0_WEST_IN, node, focusedPipeIds);
        drawSelections(svg, NOCLinkName.NOC0_SOUTH_OUT, node, focusedPipeIds);
        drawSelections(svg, NOCLinkName.NOC0_NORTH_IN, node, focusedPipeIds);
        drawSelections(svg, NOCLinkName.NOC0_IN, node, focusedPipeIds);
        drawSelections(svg, NOCLinkName.NOC0_OUT, node, focusedPipeIds);

        drawSelections(svg, NOCLinkName.NOC1_NORTH_OUT, node, focusedPipeIds);
        drawSelections(svg, NOCLinkName.NOC1_SOUTH_IN, node, focusedPipeIds);
        drawSelections(svg, NOCLinkName.NOC1_WEST_OUT, node, focusedPipeIds);
        drawSelections(svg, NOCLinkName.NOC1_EAST_IN, node, focusedPipeIds);
        drawSelections(svg, NOCLinkName.NOC1_IN, node, focusedPipeIds);
        drawSelections(svg, NOCLinkName.NOC1_OUT, node, focusedPipeIds);
    }
    return <svg className='node-focus-svg' ref={svgRef} width={NODE_SIZE} height={NODE_SIZE} />;
};

export default NodeFocusPipeRenderer;
