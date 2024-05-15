// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent Inc.

import { FC, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { ComputeNode } from '../../../data/GraphOnChip';
import { ComputeNodeType } from '../../../data/Types';
import { getLinkSaturation } from '../../../data/store/selectors/linkSaturation.selectors';
import { calculateLinkCongestionColor, getOffChipCongestionStyles, toRGBA } from '../../../utils/DrawingAPI';
import type { LinkState } from '../../../data/StateTypes';

interface OffChipNodeLinkCongestionLayerProps {
    node: ComputeNode;
    linksData: Record<string, LinkState>;
    showLinkSaturation: boolean;
    isHighContrast: boolean;
}

/**
 * This renders a congestion layer for nodes with off chip links (DRAM, Ethernet, PCIe)  for those links
 */
const OffChipNodeLinkCongestionLayer: FC<OffChipNodeLinkCongestionLayerProps> = ({
    node,
    linksData,
    showLinkSaturation,
    isHighContrast,
}) => {
    const linkSaturationTreshold = useSelector(getLinkSaturation);

    const saturationValues = useMemo(() => {
        let offChipLinkIds: string[] = [];

        switch (node.type) {
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
                break;
        }

        return offChipLinkIds.map((linkId) => linksData[linkId]?.saturation) || [0];
    }, [linksData, node]);

    const saturation = Math.max(...saturationValues) || 0;
    let congestionStyle = {};

    if (showLinkSaturation && saturation >= linkSaturationTreshold) {
        const congestionColor = calculateLinkCongestionColor(saturation, 0, isHighContrast);
        const saturationBg = toRGBA(congestionColor, 0.5);
        congestionStyle = getOffChipCongestionStyles(saturationBg);
    }

    return <div className='off-chip-congestion' style={congestionStyle} />;
};

export default OffChipNodeLinkCongestionLayer;
