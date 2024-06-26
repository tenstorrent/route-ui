// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent Inc.

import { FC, useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
    getCLKMhz,
    getDRAMBandwidth,
    getLinkSaturation,
    getPCIBandwidth,
    getShowLinkSaturation,
    getTotalOpsForGraph,
} from '../../../data/store/selectors/linkSaturation.selectors';
import { calculateLinkCongestionColor, getOffChipCongestionStyles, toRGBA } from '../../../utils/DrawingAPI';
import { getHighContrastState } from '../../../data/store/selectors/uiState.selectors';
import { calculateLinkSaturationMetrics } from '../../../data/store/slices/linkSaturation.slice';
import type { NOCLink } from '../../../data/GraphOnChip';

interface OffChipNodeLinkCongestionLayerProps {
    temporalEpoch: number;
    links: Map<any, NOCLink>;
    offchipLinkIds: string[];
}

/**
 * This renders a congestion layer for nodes with off chip links (DRAM, Ethernet, PCIe)  for those links
 */
const OffChipNodeLinkCongestionLayer: FC<OffChipNodeLinkCongestionLayerProps> = ({
    temporalEpoch,
    links,
    offchipLinkIds,
}) => {
    const linkSaturationThreshold = useSelector(getLinkSaturation);
    const isHighContrast = useSelector(getHighContrastState);
    const showLinkSaturation = useSelector(getShowLinkSaturation);
    const DRAMBandwidth = useSelector(getDRAMBandwidth);
    const PCIBandwidth = useSelector(getPCIBandwidth);
    const CLKMHz = useSelector(getCLKMhz);
    const totalOps = useSelector(getTotalOpsForGraph(temporalEpoch));

    const offchipLinkSaturation = useMemo(
        () =>
            [...links.entries()].reduce((maxSaturation, [linkId, link]) => {
                if (offchipLinkIds.includes(linkId)) {
                    const { saturation } = calculateLinkSaturationMetrics({
                        DRAMBandwidth,
                        PCIBandwidth,
                        CLKMHz,
                        linkType: link.type,
                        totalDataBytes: link.totalDataBytes,
                        totalOps,
                initialMaxBandwidth: link.maxBandwidth,
                    });

                    return Math.max(maxSaturation, saturation);
                }

                return maxSaturation;
            }, 0),
        [CLKMHz, DRAMBandwidth, PCIBandwidth, links, offchipLinkIds, totalOps],
    );

    let congestionStyle = {};

    if (showLinkSaturation && offchipLinkSaturation >= linkSaturationThreshold) {
        const congestionColor = calculateLinkCongestionColor(offchipLinkSaturation, 0, isHighContrast);
        const saturationBg = toRGBA(congestionColor, 0.5);
        congestionStyle = getOffChipCongestionStyles(saturationBg);
    }

    return <div className='off-chip-congestion' style={congestionStyle} />;
};

export default OffChipNodeLinkCongestionLayer;
