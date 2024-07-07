// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent Inc.

import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { NetworkCongestionState } from 'data/StateTypes';
import { LinkType, NOC } from 'data/Types';
import {
    AICLK_INITIAL_MHZ,
    DRAM_BANDWIDTH_INITIAL_GBS,
    ETH_BANDWIDTH_INITIAL_GBS,
    LINK_SATURATION_INITIAIL_PERCENT,
    PCIE_BANDWIDTH_INITIAL_GBS,
} from 'data/constants';

const networkCongestionInitialState: NetworkCongestionState = {
    linkSaturationTreshold: LINK_SATURATION_INITIAIL_PERCENT,
    linksPerTemporalEpoch: [],
    CLKMHz: AICLK_INITIAL_MHZ,
    DRAMBandwidthGBs: DRAM_BANDWIDTH_INITIAL_GBS,
    PCIBandwidthGBs: PCIE_BANDWIDTH_INITIAL_GBS,
    showLinkSaturation: false,
    showNOC0: true,
    showNOC1: true,
};

const linkSaturationSlice = createSlice({
    name: 'linkSaturation',
    initialState: networkCongestionInitialState,
    reducers: {
        updateLinkSaturation: (state, action: PayloadAction<number>) => {
            state.linkSaturationTreshold = action.payload;
        },
        updateTotalOPs: (state, action: PayloadAction<{ temporalEpoch: number; totalOps: number }>) => {
            const { temporalEpoch, totalOps } = action.payload;
            const temporalEpochState = state.linksPerTemporalEpoch[temporalEpoch];

            if (temporalEpochState) {
                temporalEpochState.totalOps = totalOps;
            }
        },
        updateEpochNormalizedOP: (state, action: PayloadAction<{ epoch: number; updatedValue: number }>) => {
            const { epoch, updatedValue } = action.payload;
            state.linksPerTemporalEpoch[epoch].normalizedTotalOps = updatedValue;
        },
        initialLoadLinkData: (state, action: PayloadAction<NetworkCongestionState['linksPerTemporalEpoch']>) => {
            state.linksPerTemporalEpoch = action.payload;
        },
        updateCLK: (state, action: PayloadAction<number>) => {
            state.CLKMHz = action.payload;
        },
        updateDRAMBandwidth: (state, action: PayloadAction<number>) => {
            state.DRAMBandwidthGBs = action.payload;
        },
        updatePCIBandwidth: (state, action: PayloadAction<number>) => {
            state.PCIBandwidthGBs = action.payload;
        },
        updateShowLinkSaturation: (state, action: PayloadAction<boolean>) => {
            state.showLinkSaturation = action.payload;
        },
        updateShowNOC: (state, action: PayloadAction<{ noc: NOC; selected: boolean }>) => {
            const { noc, selected } = action.payload;
            if (noc === NOC.NOC0) {
                state.showNOC0 = selected;
            } else if (noc === NOC.NOC1) {
                state.showNOC1 = selected;
            }
        },
        resetNetworksState: (state) => {
            state.linksPerTemporalEpoch = [];
        },
    },
});

interface LinkSaturationMetrics {
    linkType: LinkType;
    totalOps: number;
    DRAMBandwidth: number;
    PCIBandwidth: number;
    CLKMHz: number;
    totalDataBytes: number;
}

export const calculateLinkSaturationMetrics = ({
    linkType,
    totalOps,
    DRAMBandwidth,
    CLKMHz,
    PCIBandwidth,
    totalDataBytes,
}: LinkSaturationMetrics) => {
    const DRAMBandwidthBytes = DRAMBandwidth * 1000 * 1000 * 1000;
    const PCIBandwidthGBs = PCIBandwidth * 1000 * 1000 * 1000;
    const CLKHz = CLKMHz * 1000 * 1000;

    let maxBandwidth = 0;

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

export const {
    initialLoadLinkData,
    updateTotalOPs,
    updateLinkSaturation,
    updateCLK,
    updateDRAMBandwidth,
    updatePCIBandwidth,
    updateShowLinkSaturation,
    updateShowNOC,
    resetNetworksState,
    updateEpochNormalizedOP,
} = linkSaturationSlice.actions;

export const linkSaturationReducer = linkSaturationSlice.reducer;
