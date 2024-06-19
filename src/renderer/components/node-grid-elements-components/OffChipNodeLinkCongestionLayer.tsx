// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent AI ULC

import { FC } from 'react';
import { useSelector } from 'react-redux';
import { getLinkSaturation } from '../../../data/store/selectors/linkSaturation.selectors';
import { calculateLinkCongestionColor, getOffChipCongestionStyles, toRGBA } from '../../../utils/DrawingAPI';

interface OffChipNodeLinkCongestionLayerProps {
    offchipLinkSaturation: number;
    showLinkSaturation: boolean;
    isHighContrast: boolean;
}

/**
 * This renders a congestion layer for nodes with off chip links (DRAM, Ethernet, PCIe)  for those links
 */
const OffChipNodeLinkCongestionLayer: FC<OffChipNodeLinkCongestionLayerProps> = ({
    offchipLinkSaturation,
    showLinkSaturation,
    isHighContrast,
}) => {
    const linkSaturationThreshold = useSelector(getLinkSaturation);

    let congestionStyle = {};

    if (showLinkSaturation && offchipLinkSaturation >= linkSaturationThreshold) {
        const congestionColor = calculateLinkCongestionColor(offchipLinkSaturation, 0, isHighContrast);
        const saturationBg = toRGBA(congestionColor, 0.5);
        congestionStyle = getOffChipCongestionStyles(saturationBg);
    }

    return <div className='off-chip-congestion' style={congestionStyle} />;
};

export default OffChipNodeLinkCongestionLayer;
