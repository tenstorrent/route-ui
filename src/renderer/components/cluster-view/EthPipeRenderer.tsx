// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent AI ULC

import * as d3 from 'd3';
import { FC, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { ComputeNode } from '../../../data/GraphOnChip';
import { CLUSTER_ETH_POSITION, EthernetLinkName } from '../../../data/Types';
import { CLUSTER_NODE_GRID_SIZE } from '../../../data/constants';
import {
    getAllLinksForGraph,
    getLinkSaturation,
    getShowLinkSaturation,
} from '../../../data/store/selectors/linkSaturation.selectors';
import { getFocusPipe, getSelectedPipesIds } from '../../../data/store/selectors/pipeSelection.selectors';
import { getHighContrastState } from '../../../data/store/selectors/uiState.selectors';
import { calculateLinkCongestionColor, drawEthLink, drawEthPipes } from '../../../utils/DrawingAPI';

interface EthPipeRendererProps {
    id: string;
    node: ComputeNode | undefined;
    graphName: string | undefined;
    ethPosition: CLUSTER_ETH_POSITION;
    index: number;
    clusterChipSize: number;
    normalizedSaturation: boolean;
}

const EthPipeRenderer: FC<EthPipeRendererProps> = ({
    id,
    node,
    graphName,
    ethPosition,
    index,
    clusterChipSize,
    normalizedSaturation,
}) => {
    const svgRef = useRef<SVGSVGElement | null>(null);
    const selectedPipeIds = useSelector(getSelectedPipesIds);

    const { x, y } = calculateEthPosition(ethPosition, index);

    const nodePipeIn = !node
        ? []
        : node
              .getInternalLinksForNode()
              .filter((link) => link.name === EthernetLinkName.ETH_IN)
              .map((link) => link.pipes)
              .map((pipe) => pipe.map((pipeSegment) => pipeSegment.id))
              .flat();

    const nodePipeOut = !node
        ? []
        : node
              .getInternalLinksForNode()
              .filter((link) => link.name === EthernetLinkName.ETH_OUT)
              .map((link) => link.pipes)
              .map((pipe) => pipe.map((pipeSegment) => pipeSegment.id))
              .flat();
    const size = clusterChipSize / CLUSTER_NODE_GRID_SIZE - 5; // grid, 5 gap

    const focusPipeId = useSelector(getFocusPipe);

    const showLinkSaturation = useSelector(getShowLinkSaturation);
    const linkSaturationTreshold = useSelector(getLinkSaturation);
    const linksData = useSelector(getAllLinksForGraph(graphName || ''));
    const isHighContrast = useSelector(getHighContrastState);

    useEffect(() => {
        if (svgRef.current) {
            const svg = d3.select(svgRef.current);
            svg.selectAll('*').remove();
            if (showLinkSaturation && linksData) {
                node?.internalLinks.forEach((link) => {
                    if (link.name === EthernetLinkName.ETH_IN || link.name === EthernetLinkName.ETH_OUT) {
                        const linkStateData = linksData[link.uid];
                        if (normalizedSaturation) {
                            if (linkStateData && linkStateData.normalizedSaturation >= linkSaturationTreshold) {
                                const color = calculateLinkCongestionColor(
                                    linkStateData.normalizedSaturation,
                                    0,
                                    isHighContrast,
                                );
                                drawEthLink(svg, ethPosition, link.name, size, color, 6);
                            }
                        } else if (linkStateData && linkStateData.saturation >= linkSaturationTreshold) {
                            const color = calculateLinkCongestionColor(linkStateData.saturation, 0, isHighContrast);
                            drawEthLink(svg, ethPosition, link.name, size, color, 6);
                        }
                    }
                });
            }
            if (focusPipeId) {
                drawEthPipes(
                    svg,
                    ethPosition,
                    nodePipeIn.filter((pipe) => pipe === focusPipeId),
                    EthernetLinkName.ETH_IN,
                    size,
                );
                drawEthPipes(
                    svg,
                    ethPosition,
                    nodePipeOut.filter((pipe) => pipe === focusPipeId),
                    EthernetLinkName.ETH_OUT,
                    size,
                );
            } else {
                drawEthPipes(
                    svg,
                    ethPosition,
                    nodePipeIn.filter((pipeId) => selectedPipeIds.includes(pipeId)) || [],
                    EthernetLinkName.ETH_IN,
                    size,
                );
                drawEthPipes(
                    svg,
                    ethPosition,
                    nodePipeOut.filter((pipeId) => selectedPipeIds.includes(pipeId)) || [],
                    EthernetLinkName.ETH_OUT,
                    size,
                );
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        //
        nodePipeIn,
        nodePipeOut,
        focusPipeId,
        selectedPipeIds,
        showLinkSaturation,
        linkSaturationTreshold,
        linksData,
    ]);

    return (
        <div
            title={`${id}`}
            className={`eth eth-position-${ethPosition}`}
            style={{
                opacity: nodePipeIn.length > 0 || nodePipeOut.length > 0 ? 1 : 0.2,
                gridColumn: x,
                gridRow: y,
                fontSize: '10px',
                color: 'black',
                textAlign: 'center',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: `${size}px`,
                height: `${size}px`,
            }}
        >
            <svg className='eth-svg' ref={svgRef} width={`${size}px`} height={`${size}px`} />
        </div>
    );
};
export default EthPipeRenderer;

const calculateEthPosition = (ethPosition: CLUSTER_ETH_POSITION, index: number) => {
    let x = 0;
    let y = 0;
    switch (ethPosition) {
        case CLUSTER_ETH_POSITION.TOP:
            x = index + 2;
            y = 1;
            break;
        case CLUSTER_ETH_POSITION.BOTTOM:
            x = index + 2;
            y = CLUSTER_NODE_GRID_SIZE;
            break;
        case CLUSTER_ETH_POSITION.LEFT:
            x = 1;
            y = index + 2;
            break;
        case CLUSTER_ETH_POSITION.RIGHT:
            x = CLUSTER_NODE_GRID_SIZE;
            y = index + 2;
            break;
        default:
            return { x, y };
    }
    return { x, y };
};
