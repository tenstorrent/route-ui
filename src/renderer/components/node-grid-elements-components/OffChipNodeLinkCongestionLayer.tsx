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
import type { DramBankLink, NetworkLink } from '../../../data/GraphOnChip';
import { ComputeNodeType } from '../../../data/Types';

interface OffChipNodeLinkCongestionLayerProps {
    temporalEpoch: number;
    nodeType: ComputeNodeType;
    dramLinks?: DramBankLink[];
    internalLinks?: Map<any, NetworkLink>;
}

/**
 * This renders a congestion layer for nodes with off chip links (DRAM, Ethernet, PCIe)  for those links
 */
const OffChipNodeLinkCongestionLayer: FC<OffChipNodeLinkCongestionLayerProps> = ({
    temporalEpoch,
    nodeType,
    dramLinks,
    internalLinks,
}) => {
    const linkSaturationThreshold = useSelector(getLinkSaturation);
    const isHighContrast = useSelector(getHighContrastState);
    const showLinkSaturation = useSelector(getShowLinkSaturation);
    const DRAMBandwidth = useSelector(getDRAMBandwidth);
    const PCIBandwidth = useSelector(getPCIBandwidth);
    const CLKMHz = useSelector(getCLKMhz);
    const totalOps = useSelector(getTotalOpsForGraph(temporalEpoch));
    const links = useMemo(() => {
        let resolvedLinks: DramBankLink[] | NetworkLink[] = [];

        if (nodeType === ComputeNodeType.DRAM) {
            resolvedLinks = dramLinks ?? [];
        }

        if (nodeType === ComputeNodeType.ETHERNET || nodeType === ComputeNodeType.PCIE) {
            resolvedLinks = [...(internalLinks ?? []).values()];
        }

        return resolvedLinks;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const offchipLinkSaturation = useMemo(() => {
        return links.reduce((maxSaturation, link) => {
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
        }, 0);
    }, [CLKMHz, DRAMBandwidth, PCIBandwidth, links, totalOps]);

    let congestionStyle = {};

    if (showLinkSaturation && offchipLinkSaturation >= linkSaturationThreshold) {
        const congestionColor = calculateLinkCongestionColor(offchipLinkSaturation, 0, isHighContrast);
        const saturationBg = toRGBA(congestionColor, 0.5);
        congestionStyle = getOffChipCongestionStyles(saturationBg);
    }

    return <div className='off-chip-congestion' style={congestionStyle} />;
};

OffChipNodeLinkCongestionLayer.defaultProps = {
    internalLinks: undefined,
    dramLinks: undefined,
};

export default OffChipNodeLinkCongestionLayer;
