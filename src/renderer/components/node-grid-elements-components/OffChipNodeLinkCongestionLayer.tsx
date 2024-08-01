// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent AI ULC

import { FC, useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
    getCLKMhz,
    getDRAMBandwidth,
    getLinkSaturation,
    getPCIBandwidth,
    getShowLinkSaturation,
    getTotalOpsForChipId,
    getTotalOpsforTemporalEpoch,
} from '../../../data/store/selectors/linkSaturation.selectors';
import { calculateLinkCongestionColor, getOffChipCongestionStyles, toRGBA } from '../../../utils/DrawingAPI';
import { getHighContrastState } from '../../../data/store/selectors/uiState.selectors';
import { recalculateLinkSaturationMetrics } from '../../utils/linkSaturation';
import type { DramBankLink, NetworkLink } from '../../../data/GraphOnChip';
import { ComputeNodeType } from '../../../data/Types';

interface OffChipNodeLinkCongestionLayerProps {
    temporalEpoch: number;
    chipId?: number;
    nodeType: ComputeNodeType;
    dramLinks?: DramBankLink[];
    internalLinks?: Map<any, NetworkLink>;
}

/**
 * This renders a congestion layer for nodes with off chip links (DRAM, Ethernet, PCIe)  for those links
 */
const OffChipNodeLinkCongestionLayer: FC<OffChipNodeLinkCongestionLayerProps> = ({
    temporalEpoch,
    chipId,
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
    const totalOps = useSelector(
        chipId !== undefined ? getTotalOpsForChipId(temporalEpoch, chipId) : getTotalOpsforTemporalEpoch(temporalEpoch),
    );
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
            const { saturation } = recalculateLinkSaturationMetrics({
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
    chipId: undefined,
    internalLinks: undefined,
    dramLinks: undefined,
};

export default OffChipNodeLinkCongestionLayer;
