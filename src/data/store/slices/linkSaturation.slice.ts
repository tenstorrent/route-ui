// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent AI ULC

import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { NetworkCongestionState } from '../../StateTypes';
import { NOC } from '../../Types';
import {
    AICLK_INITIAL_MHZ,
    DRAM_BANDWIDTH_INITIAL_GBS,
    LINK_SATURATION_INITIAIL_PERCENT,
    PCIE_BANDWIDTH_INITIAL_GBS,
} from '../../constants';

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
        updateEpochTotalOPs: (state, action: PayloadAction<{ temporalEpoch: number; totalOps: number }>) => {
            const { temporalEpoch, totalOps } = action.payload;
            const temporalEpochState = state.linksPerTemporalEpoch[temporalEpoch];

            if (temporalEpochState) {
                temporalEpochState.totalOps = totalOps;
            }
        },
        updateChipTotalOps: (
            state,
            action: PayloadAction<{ temporalEpoch: number; chipId: number; totalOps: number }>,
        ) => {
            const { temporalEpoch, totalOps, chipId } = action.payload;
            const temporalEpochState = state.linksPerTemporalEpoch[temporalEpoch];

            if (temporalEpochState && temporalEpochState.totalOpsByChipId[chipId] !== undefined) {
                temporalEpochState.totalOpsByChipId[chipId] = totalOps;
            }
        },
        updateEpochNormalizedOP: (state, action: PayloadAction<{ epoch: number; updatedValue: number }>) => {
            const { epoch, updatedValue } = action.payload;

            if (state.linksPerTemporalEpoch[epoch]) {
                state.linksPerTemporalEpoch[epoch]!.normalizedTotalOps = updatedValue;
            }
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

export const {
    initialLoadLinkData,
    updateEpochTotalOPs,
    updateChipTotalOps,
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
