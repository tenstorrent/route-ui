// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent Inc.

import { FC } from 'react';
import { useSelector } from 'react-redux';
import { getLinkSaturation } from '../../../data/store/selectors/linkSaturation.selectors';
import { calculateLinkCongestionColor, getOffChipCongestionStyles, toRGBA } from '../../../utils/DrawingAPI';
import { getHighContrastState } from '../../../data/store/selectors/uiState.selectors';

interface OffChipNodeLinkCongestionLayerProps {
    offchipLinkSaturation: number;
    showLinkSaturation: boolean;
}

/**
 * This renders a congestion layer for nodes with off chip links (DRAM, Ethernet, PCIe)  for those links
 */
const OffChipNodeLinkCongestionLayer: FC<OffChipNodeLinkCongestionLayerProps> = ({
    offchipLinkSaturation,
    showLinkSaturation,
}) => {
    const linkSaturationThreshold = useSelector(getLinkSaturation);
    const isHighContrast = useSelector(getHighContrastState);

    let congestionStyle = {};

    if (showLinkSaturation && offchipLinkSaturation >= linkSaturationThreshold) {
        const congestionColor = calculateLinkCongestionColor(offchipLinkSaturation, 0, isHighContrast);
        const saturationBg = toRGBA(congestionColor, 0.5);
        congestionStyle = getOffChipCongestionStyles(saturationBg);
    }

    return <div className='off-chip-congestion' style={congestionStyle} />;
};

export default OffChipNodeLinkCongestionLayer;
