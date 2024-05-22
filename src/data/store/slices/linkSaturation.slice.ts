// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent Inc.

import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { LinkState, NetworkCongestionState } from 'data/StateTypes';
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
    graphs: [],
    epochNormalizedTotalOps: [],
    epochAdjustedTotalOps: [],
    CLKMHz: AICLK_INITIAL_MHZ,
    DRAMBandwidthGBs: DRAM_BANDWIDTH_INITIAL_GBS,
    PCIBandwidthGBs: PCIE_BANDWIDTH_INITIAL_GBS,
    showLinkSaturation: false,
    showNOC0: true,
    showNOC1: true,
};

const getInitialCLKValues = (state: NetworkCongestionState) => {
    const DRAMBandwidthBytes = state.DRAMBandwidthGBs * 1000 * 1000 * 1000; // there is a reason why this is not 1024
    const PCIBandwidthGBs = state.PCIBandwidthGBs * 1000 * 1000 * 1000; // there is a reason why this is not 1024
    const CLKHz = state.CLKMHz * 1000 * 1000;

    return {
        DRAMBandwidthBytes,
        PCIBandwidthGBs,
        CLKHz,
    };
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
            const graphState = state.graphs[temporalEpoch];
            const { DRAMBandwidthBytes, PCIBandwidthGBs, CLKHz } = getInitialCLKValues(state);

            if (graphState) {
                graphState.totalOps = totalOps;
                Object.values(graphState.links).forEach((linkState) => {
                    if (linkState.type === LinkType.ETHERNET) {
                        linkState.maxBandwidth = ETH_BANDWIDTH_INITIAL_GBS;
                    } else if (linkState.type === LinkType.DRAM) {
                        linkState.maxBandwidth = DRAMBandwidthBytes / CLKHz;
                    } else if (linkState.type === LinkType.PCIE) {
                        linkState.maxBandwidth = PCIBandwidthGBs / CLKHz;
                    }
                    recalculateLinkSaturation(linkState, totalOps);
                });
            }
        },
        initialLoadTotalOPs: (state, action: PayloadAction<number[]>) => {
            action.payload.forEach((totalOps, temporalEpoch) => {
                const graphState = state.graphs[temporalEpoch];
                const { DRAMBandwidthBytes, PCIBandwidthGBs, CLKHz } = getInitialCLKValues(state);

                if (graphState) {
                    graphState.totalOps = totalOps;
                    Object.values(graphState.links).forEach((linkState) => {
                        if (linkState.type === LinkType.ETHERNET) {
                            linkState.maxBandwidth = ETH_BANDWIDTH_INITIAL_GBS;
                        } else if (linkState.type === LinkType.DRAM) {
                            linkState.maxBandwidth = DRAMBandwidthBytes / CLKHz;
                        } else if (linkState.type === LinkType.PCIE) {
                            linkState.maxBandwidth = PCIBandwidthGBs / CLKHz;
                        }
                        recalculateLinkSaturation(linkState, totalOps);
                    });
                }
            });
        },
        initialLoadNormalizedOPs: (state, action: PayloadAction<{ perEpoch: number[] }>) => {
            const { perEpoch } = action.payload;
            state.epochNormalizedTotalOps = perEpoch;
            state.epochAdjustedTotalOps = perEpoch;

            perEpoch.forEach((normalizedOpCycles, epoch) => {
                const graphState = state.graphs[epoch];

                if (graphState.links) {
                    Object.values(graphState.links).forEach((linkState: LinkState) => {
                        if (linkState.type === LinkType.ETHERNET) {
                            calculateNormalizedSaturation(linkState, normalizedOpCycles);
                        }
                    });
                }
            });
        },
        updateEpochNormalizedOP: (state, action: PayloadAction<{ epoch: number; updatedValue: number }>) => {
            const { epoch, updatedValue } = action.payload;
            state.epochAdjustedTotalOps[epoch] = updatedValue;

            Object.values(state.graphs[epoch].links).forEach((linkState: LinkState) => {
                if (linkState.type === LinkType.ETHERNET) {
                    calculateNormalizedSaturation(linkState, updatedValue);
                }
            });
        },
        initialLoadLinkData: (state, action: PayloadAction<LinkState[][]>) => {
            action.payload.forEach((graphData, temporalEpoch) => {
                if (!state.graphs[temporalEpoch]) {
                    state.graphs[temporalEpoch] = { links: {}, totalOps: 0 };
                }

                graphData.forEach((item) => {
                    state.graphs[temporalEpoch].links[item.id] = item;
                });
            });
        },
        updateCLK: (state, action: PayloadAction<number>) => {
            state.CLKMHz = action.payload;
            updateDRAMLinks(state);
        },
        updateDRAMBandwidth: (state, action: PayloadAction<number>) => {
            state.DRAMBandwidthGBs = action.payload;
            updateDRAMLinks(state);
        },
        updatePCIBandwidth: (state, action: PayloadAction<number>) => {
            state.PCIBandwidthGBs = action.payload;
            updatePCILinks(state);
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
            state.graphs = [];
        },
    },
});

const updateDRAMLinks = (state: NetworkCongestionState) => {
    const { DRAMBandwidthBytes, CLKHz } = getInitialCLKValues(state);

    Object.values(state.graphs).forEach((graphState) => {
        Object.values(graphState.links).forEach((linkState: LinkState) => {
            if (linkState.type === LinkType.DRAM) {
                linkState.maxBandwidth = DRAMBandwidthBytes / CLKHz;
                recalculateLinkSaturation(linkState, graphState.totalOps);
            }
        });
    });
};

const updatePCILinks = (state: NetworkCongestionState) => {
    const { PCIBandwidthGBs, CLKHz } = getInitialCLKValues(state);

    Object.values(state.graphs).forEach((graphState) => {
        Object.values(graphState.links).forEach((linkState: LinkState) => {
            if (linkState.type === LinkType.PCIE) {
                linkState.maxBandwidth = PCIBandwidthGBs / CLKHz;
                recalculateLinkSaturation(linkState, graphState.totalOps);
            }
        });
    });
};

const recalculateLinkSaturation = (link: LinkState, totalOpCycles: number) => {
    link.bpc = link.totalDataBytes / totalOpCycles;
    link.saturation = (link.bpc / link.maxBandwidth) * 100;
};

const calculateNormalizedSaturation = (link: LinkState, normalizedOpCycles: number) => {
    const bpc = link.totalDataBytes / normalizedOpCycles;
    link.normalizedSaturation = (bpc / link.maxBandwidth) * 100;
};
export const {
    initialLoadLinkData,
    updateTotalOPs,
    initialLoadTotalOPs,
    updateLinkSaturation,
    updateCLK,
    updateDRAMBandwidth,
    updatePCIBandwidth,
    updateShowLinkSaturation,
    updateShowNOC,
    resetNetworksState,
    initialLoadNormalizedOPs,
    updateEpochNormalizedOP,
} = linkSaturationSlice.actions;

export const linkSaturationReducer = linkSaturationSlice.reducer;
