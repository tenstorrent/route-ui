import { FC, useContext, useRef } from 'react';
import { useSelector } from 'react-redux';
import * as d3 from 'd3';
import { ComputeNode } from '../../../data/GraphOnChip';
import { getHighContrastState, getShowEmptyLinks } from '../../../data/store/selectors/uiState.selectors';
import { RootState } from '../../../data/store/createStore';
import { PipeSelection } from '../../../data/StateTypes';
import {
    NOC_CONFIGURATION,
    NODE_SIZE,
    calculateLinkCongestionColor,
    drawLink,
    drawNOCRouter,
    drawSelections,
} from '../../../utils/DrawingAPI';
import { NOC, NOCLinkName } from '../../../data/Types';
import {
    getAllLinksForGraph,
    getLinkSaturation,
    getShowLinkSaturation
} from '../../../data/store/selectors/linkSaturation.selectors';
import { GraphOnChipContext } from '../../../data/GraphOnChipDataProvider';

interface NodePipeRendererProps {
    node: ComputeNode;
}

const NodePipeRenderer: FC<NodePipeRendererProps> = ({ node }) => {
    // TODO: note to future self this is working incidently, but once gridview starts being generated later or regenerated this will likely need a useEffect
    const isHighContrast = useSelector(getHighContrastState);
    const graphName = useContext(GraphOnChipContext).getGraphName();
    const linksData = useSelector((state: RootState) => getAllLinksForGraph(state, graphName));

    const focusPipe = useSelector((state: RootState) => state.pipeSelection.focusPipe);
    const allPipes = useSelector((state: RootState) => state.pipeSelection.pipes);
    const selectedPipeIds = Object.values(allPipes)
        .filter((pipe: PipeSelection) => pipe.selected)
        .map((pipe: PipeSelection) => pipe.id);

    const svgRef = useRef<SVGSVGElement | null>(null);
    const svg = d3.select(svgRef.current);

    const showLinkSaturation = useSelector(getShowLinkSaturation);
    const linkSaturationTreshold = useSelector(getLinkSaturation);

    const noc0Saturation = useSelector((state: RootState) => state.linkSaturation.showNOC0);
    const noc1Saturation = useSelector((state: RootState) => state.linkSaturation.showNOC1);

    const showEmptyLinks = useSelector(getShowEmptyLinks);

    svg.selectAll('*').remove();

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

    if (showLinkSaturation) {
        node.links.forEach((link) => {
            if ((link.noc === NOC.NOC0 && noc0Saturation) || (link.noc === NOC.NOC1 && noc1Saturation)) {
                const linkStateData = linksData[link.uid];

                if (linkStateData && linkStateData.saturation >= linkSaturationTreshold) {
                    const color = calculateLinkCongestionColor(linkStateData.saturation, 0, isHighContrast);
                    drawLink(svg, link.name, color, 5);
                }
            }
        });
    }

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
