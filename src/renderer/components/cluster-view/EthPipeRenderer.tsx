// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent Inc.

import * as d3 from 'd3';
import { FC, useEffect, useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';
import { ComputeNode } from '../../../data/GraphOnChip';
import { CLUSTER_ETH_POSITION, EthernetLinkName } from '../../../data/Types';
import { CLUSTER_NODE_GRID_SIZE } from '../../../data/constants';
import {
    getEpochNormalizedTotalOps,
    getLinkSaturation,
    getShowLinkSaturation,
    getTotalOpsForGraph,
} from '../../../data/store/selectors/linkSaturation.selectors';
import { getFocusPipe, getSelectedPipesIds } from '../../../data/store/selectors/pipeSelection.selectors';
import { getHighContrastState } from '../../../data/store/selectors/uiState.selectors';
import { calculateLinkCongestionColor, drawEthLink, drawEthPipes } from '../../../utils/DrawingAPI';
import { calculateLinkSaturationMetrics } from '../../../data/store/slices/linkSaturation.slice';

interface EthPipeRendererProps {
    id: string;
    node: ComputeNode | undefined;
    temporalEpoch: number;
    ethPosition: CLUSTER_ETH_POSITION;
    index: number;
    clusterChipSize: number;
    showNormalizedSaturation: boolean;
}

const EthPipeRenderer: FC<EthPipeRendererProps> = ({
    id,
    node,
    temporalEpoch,
    ethPosition,
    index,
    clusterChipSize,
    showNormalizedSaturation,
}) => {
    const svgRef = useRef<SVGSVGElement | null>(null);
    const selectedPipeIds = useSelector(getSelectedPipesIds);

    const { x, y } = calculateEthPosition(ethPosition, index);

    const nodePipeIn = useMemo(
        () =>
            !node
                ? []
                : node
                      .getInternalLinksForNode()
                      .filter((link) => link.name === EthernetLinkName.ETH_IN)
                      .map((link) => link.pipes)
                      .map((pipe) => pipe.map((pipeSegment) => pipeSegment.id))
                      .flat(),
        [node],
    );

    const nodePipeOut = useMemo(
        () =>
            !node
                ? []
                : node
                      .getInternalLinksForNode()
                      .filter((link) => link.name === EthernetLinkName.ETH_OUT)
                      .map((link) => link.pipes)
                      .map((pipe) => pipe.map((pipeSegment) => pipeSegment.id))
                      .flat(),
        [node],
    );
    const size = clusterChipSize / CLUSTER_NODE_GRID_SIZE - 5; // grid, 5 gap

    const focusPipeId = useSelector(getFocusPipe);

    const showLinkSaturation = useSelector(getShowLinkSaturation);
    const linkSaturationTreshold = useSelector(getLinkSaturation);
    const isHighContrast = useSelector(getHighContrastState);
    const totalOps = useSelector(getTotalOpsForGraph(temporalEpoch));
    const normalizedTotalOps = useSelector(getEpochNormalizedTotalOps(temporalEpoch));

    useEffect(() => {
        if (svgRef.current) {
            const svg = d3.select(svgRef.current);
            svg.selectAll('*').remove();

            if (showLinkSaturation && (node?.ethLinkNames ?? []).length > 0) {
                node?.ethLinkNames.forEach((linkName) => {
                    const link = node.links.get(linkName);

                    if (link) {
                        // Set all to 0 as we are not using them here.
                        const unusedProperties = {
                            DRAMBandwidth: 0,
                            CLKMHz: 0,
                            PCIBandwidth: 0,
                        };

                        const { saturation } = calculateLinkSaturationMetrics({
                            ...unusedProperties,
                            totalOps,
                            linkType: link.type,
                            totalDataBytes: link.totalDataBytes,
                            initialMaxBandwidth: link.maxBandwidth,
                        });

                        if (showNormalizedSaturation) {
                            const { saturation: normalizedSaturation } = calculateLinkSaturationMetrics({
                                ...unusedProperties,
                                totalOps: normalizedTotalOps,
                                linkType: link.type,
                                totalDataBytes: link.totalDataBytes,
                                initialMaxBandwidth: link.maxBandwidth,
                            });

                            if (link && normalizedSaturation >= linkSaturationTreshold) {
                                const color = calculateLinkCongestionColor(normalizedSaturation, 0, isHighContrast);
                                drawEthLink(svg, ethPosition, link.name as EthernetLinkName, size, color, 6);
                            }
                        } else if (link && saturation >= linkSaturationTreshold) {
                            const color = calculateLinkCongestionColor(saturation, 0, isHighContrast);
                            drawEthLink(svg, ethPosition, link.name as EthernetLinkName, size, color, 6);
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
    }, [
        nodePipeIn,
        nodePipeOut,
        focusPipeId,
        selectedPipeIds,
        showLinkSaturation,
        linkSaturationTreshold,
        node?.ethLinkNames,
        node?.links,
        showNormalizedSaturation,
        isHighContrast,
        ethPosition,
        size,
        totalOps,
        normalizedTotalOps,
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
