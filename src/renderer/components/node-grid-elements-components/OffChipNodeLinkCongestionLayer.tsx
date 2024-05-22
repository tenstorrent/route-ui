// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent Inc.

import { FC, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { ComputeNode } from '../../../data/GraphOnChip';
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

    const saturation = useMemo(() => {
        const saturationValues = node.offchipLinkIds.map((linkId) => linksData[linkId]?.saturation) || [0];

        return Math.max(...saturationValues) || 0;
    }, [linksData, node]);

    let congestionStyle = {};

    if (showLinkSaturation && saturation >= linkSaturationTreshold) {
        const congestionColor = calculateLinkCongestionColor(saturation, 0, isHighContrast);
        const saturationBg = toRGBA(congestionColor, 0.5);
        congestionStyle = getOffChipCongestionStyles(saturationBg);
    }

    return <div className='off-chip-congestion' style={congestionStyle} />;
};

export default OffChipNodeLinkCongestionLayer;
