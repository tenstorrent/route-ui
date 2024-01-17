import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { recalculateLinkSaturation } from 'data/Chip';
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
    showLinkSaturation: false,
    showLinkSaturationNOC0: true,
    showLinkSaturationNOC1: true,
    showEmptyLinks: false,
    showOperationColors: false,
    showNodeLocation: false,
    gridZoom: 1,
    detailedViewZoom: 1,
    links: {},
    totalOps: 0,
    CLKMHz: AICLK_INITIAL_MHZ,
    DRAMBandwidthGBs: DRAM_BANDWIDTH_INITIAL_GBS,
    PCIBandwidthGBs: PCIE_BANDWIDTH_INITIAL_GBS,
};

const linkSaturationSlice = createSlice({
    name: 'linkSaturation',
    initialState: networkCongestionInitialState,
    reducers: {
        updateLinkSaturation: (state, action: PayloadAction<number>) => {
            state.linkSaturationTreshold = action.payload;
        },
        updateShowLinkSaturation: (state, action: PayloadAction<boolean>) => {
            state.showLinkSaturation = action.payload;
        },
        updateShowLinkSaturationForNOC: (state, action: PayloadAction<{ noc: NOC; selected: boolean }>) => {
            if (action.payload.noc === NOC.NOC0) {
                state.showLinkSaturationNOC0 = action.payload.selected;
            }
            if (action.payload.noc === NOC.NOC1) {
                state.showLinkSaturationNOC1 = action.payload.selected;
            }
        },
        updateShowEmptyLinks: (state, action: PayloadAction<boolean>) => {
            state.showEmptyLinks = action.payload;
        },
        updateShowOperationColors: (state, action: PayloadAction<boolean>) => {
            state.showOperationColors = action.payload;
        },
        updateShowNodeLocation: (state, action: PayloadAction<boolean>) => {
            state.showNodeLocation = action.payload;
        },
        updateGridZoom: (state, action: PayloadAction<number>) => {
            state.gridZoom = action.payload;
        },
        updateDetailedViewZoom: (state, action: PayloadAction<number>) => {
            state.detailedViewZoom = action.payload;
        },
        updateTotalOPs: (state, action: PayloadAction<number>) => {
            state.totalOps = action.payload;
            Object.values(state.links).forEach((linkState) => {
                recalculateLinkSaturation(linkState, action.payload);
            });
        },
        loadLinkData: (state, action: PayloadAction<LinkState[]>) => {
            state.links = {};
            action.payload.forEach((item) => {
                state.links[item.id] = item;
            });
            updateDRAMLinks(state);
            updateEthernetLinks(state);
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
    },
});

const updateEthernetLinks = (state: NetworkCongestionState) => {
    Object.values(state.links).forEach((linkState: LinkState) => {
        if (linkState.type === LinkType.ETHERNET) {
            linkState.maxBandwidth = ETH_BANDWIDTH_INITIAL_GBS;
            recalculateLinkSaturation(linkState, state.totalOps);
        }
    });
};
const updateDRAMLinks = (state: NetworkCongestionState) => {
    const DRAMBandwidthBytes = state.DRAMBandwidthGBs * 1000 * 1000 * 1000; // there is a reason why this is not 1024
    const CLKHz = state.CLKMHz * 1000 * 1000;
    Object.values(state.links).forEach((linkState: LinkState) => {
        if (linkState.type === LinkType.DRAM) {
            linkState.maxBandwidth = DRAMBandwidthBytes / CLKHz;
            recalculateLinkSaturation(linkState, state.totalOps);
        }
    });
};

const updatePCILinks = (state: NetworkCongestionState) => {
    const PCIBandwidthGBs = state.PCIBandwidthGBs * 1000 * 1000 * 1000; // there is a reason why this is not 1024
    const CLKHz = state.CLKMHz * 1000 * 1000;
    Object.values(state.links).forEach((linkState: LinkState) => {
        if (linkState.type === LinkType.PCIE) {
            linkState.maxBandwidth = PCIBandwidthGBs / CLKHz;
            recalculateLinkSaturation(linkState, state.totalOps);
        }
    });
};

export const {
    //
    loadLinkData,
    updateTotalOPs,
    updateLinkSaturation,
    updateShowLinkSaturation,
    updateShowLinkSaturationForNOC,
    updateShowEmptyLinks,
    updateShowOperationColors,
    updateShowNodeLocation,
    updateGridZoom,
    updateDetailedViewZoom,
    updateCLK,
    updateDRAMBandwidth,
    updatePCIBandwidth,
} = linkSaturationSlice.actions;

export const linkSaturationReducer = linkSaturationSlice.reducer;
