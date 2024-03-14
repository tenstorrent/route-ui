import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { NetworkCongestionState, LinkState } from 'data/StateTypes';
import { LinkType, NOC } from 'data/Types';
import {
    LINK_SATURATION_INITIAIL_PERCENT,
    AICLK_INITIAL_MHZ,
    DRAM_BANDWIDTH_INITIAL_GBS,
    ETH_BANDWIDTH_INITIAL_GBS,
    PCIE_BANDWIDTH_INITIAL_GBS,
} from 'data/constants';

const networkCongestionInitialState: NetworkCongestionState = {
    linkSaturationTreshold: LINK_SATURATION_INITIAIL_PERCENT,
    graphs: {}, // Initialized as an empty record for graph-specific states
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
        updateTotalOPs: (state, action: PayloadAction<{ graphName: string; totalOps: number }>) => {
            const { graphName, totalOps } = action.payload;
            const graphState = state.graphs[graphName];
            const DRAMBandwidthBytes = state.DRAMBandwidthGBs * 1000 * 1000 * 1000; // there is a reason why this is not 1024
            const PCIBandwidthGBs = state.PCIBandwidthGBs * 1000 * 1000 * 1000; // there is a reason why this is not 1024
            const CLKHz = state.CLKMHz * 1000 * 1000;

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
        updateNormalizedOPs: (state, action: PayloadAction<{ graph: string; normalizedOps: number }>) => {
            Object.values(state.graphs[action.payload.graph].links).forEach((linkState: LinkState) => {
                if (linkState.type === LinkType.ETHERNET) {
                    calculateNormalizedSaturation(linkState, action.payload.normalizedOps);
                }
            });
        },
        loadLinkData: (state, action: PayloadAction<{ graphName: string; linkData: LinkState[] }>) => {
            const { graphName, linkData } = action.payload;
            if (!state.graphs[graphName]) {
                state.graphs[graphName] = { links: {}, totalOps: 0 };
            }
            const graphState = state.graphs[graphName];
            linkData.forEach((item) => {
                graphState.links[item.id] = item;
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
            state.graphs = {};
        },
    },
});

const updateDRAMLinks = (state: NetworkCongestionState) => {
    const DRAMBandwidthBytes = state.DRAMBandwidthGBs * 1000 * 1000 * 1000; // there is a reason why this is not 1024
    const CLKHz = state.CLKMHz * 1000 * 1000;

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
    const PCIBandwidthGBs = state.PCIBandwidthGBs * 1000 * 1000 * 1000; // there is a reason why this is not 1024
    const CLKHz = state.CLKMHz * 1000 * 1000;

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
    loadLinkData,
    updateTotalOPs,
    updateLinkSaturation,
    updateCLK,
    updateDRAMBandwidth,
    updatePCIBandwidth,
    updateShowLinkSaturation,
    updateShowNOC,
    resetNetworksState,
} = linkSaturationSlice.actions;

export const linkSaturationReducer = linkSaturationSlice.reducer;
