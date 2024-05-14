// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent Inc.

import { FC } from 'react';
import { useSelector } from 'react-redux';
import { ComputeNode } from '../../../data/GraphOnChip';
import { ComputeNodeType } from '../../../data/Types';
import {
    getAllLinksForGraph,
    getLinkSaturation,
    getShowLinkSaturation,
} from '../../../data/store/selectors/linkSaturation.selectors';
import { getHighContrastState } from '../../../data/store/selectors/uiState.selectors';
import { calculateLinkCongestionColor, getOffChipCongestionStyles, toRGBA } from '../../../utils/DrawingAPI';

interface OffChipNodeLinkCongestionLayerProps {
    node: ComputeNode;
    graphName: string;
}

/**
 * This renders a congestion layer for nodes with off chip links (DRAM, Ethernet, PCIe)  for those links
 */
const OffChipNodeLinkCongestionLayer: FC<OffChipNodeLinkCongestionLayerProps> = ({ node, graphName }) => {
    const linksData = useSelector(getAllLinksForGraph(graphName));
    const isHighContrast = useSelector(getHighContrastState);
    const showLinkSaturation = useSelector(getShowLinkSaturation);
    const linkSaturationTreshold = useSelector(getLinkSaturation);

    if (!showLinkSaturation) {
        return null;
    }

    let congestionStyle = {};
    const { type } = node;
    let offChipLinkIds: string[] = [];

    switch (type) {
        case ComputeNodeType.DRAM:
            offChipLinkIds =
                node.dramChannel?.links.map((link) => {
                    return link.uid;
                }) || [];
            break;
        case ComputeNodeType.ETHERNET:
            offChipLinkIds =
                [...node.internalLinks.values()].map((link) => {
                    return link.uid;
                }) || [];
            break;

        case ComputeNodeType.PCIE:
            offChipLinkIds =
                [...node.internalLinks].map(([link]) => {
                    return link.uid;
                }) || [];
            break;
        default:
            return null;
    }

    const saturationValues = offChipLinkIds.map((linkId) => linksData[linkId]?.saturation) || [0];
    const saturation = Math.max(...saturationValues) || 0;
    if (saturation < linkSaturationTreshold) {
        return null;
    }
    const congestionColor = calculateLinkCongestionColor(saturation, 0, isHighContrast);
    const saturationBg = toRGBA(congestionColor, 0.5);
    congestionStyle = getOffChipCongestionStyles(saturationBg);

    return <div className='off-chip-congestion' style={congestionStyle} />;
};

export default OffChipNodeLinkCongestionLayer;
