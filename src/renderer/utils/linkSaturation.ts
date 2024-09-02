// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent AI ULC

import { LinkType } from 'data/Types';
import { ETH_BANDWIDTH_INITIAL_GBS } from 'data/constants';

interface LinkSaturationMetrics {
    linkType: LinkType;
    totalOps: number;
    DRAMBandwidth: number;
    PCIBandwidth: number;
    CLKMHz: number;
    totalDataBytes: number;
    initialMaxBandwidth: number;
}

export const recalculateLinkSaturationMetrics = ({
    linkType,
    totalOps,
    DRAMBandwidth,
    CLKMHz,
    PCIBandwidth,
    totalDataBytes,
    initialMaxBandwidth,
}: LinkSaturationMetrics) => {
    const DRAMBandwidthBytes = DRAMBandwidth * 1000 * 1000 * 1000;
    const PCIBandwidthGBs = PCIBandwidth * 1000 * 1000 * 1000;
    const CLKHz = CLKMHz * 1000 * 1000;

    let maxBandwidth = initialMaxBandwidth;

    if (linkType === LinkType.ETHERNET) {
        maxBandwidth = ETH_BANDWIDTH_INITIAL_GBS;
    } else if (linkType === LinkType.DRAM) {
        maxBandwidth = DRAMBandwidthBytes / CLKHz;
    } else if (linkType === LinkType.PCIE) {
        maxBandwidth = PCIBandwidthGBs / CLKHz;
    }

    let bpc = totalDataBytes / totalOps;

    // Handle division by zero
    if (Number.isNaN(bpc) || Math.abs(bpc) === Infinity) {
        bpc = 0;
    }

    let saturation = (bpc / maxBandwidth) * 100;

    // Handle division by zero
    if (Number.isNaN(saturation) || Math.abs(saturation) === Infinity) {
        saturation = 0;
    }

    return {
        saturation,
        bpc,
        maxBandwidth,
    };
};
