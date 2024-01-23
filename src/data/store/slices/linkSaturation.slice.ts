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
    links: {},
    totalOps: 0,
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
        updateShowLinkSaturation: (state, action: PayloadAction<boolean>) => {
            state.showLinkSaturation = action.payload;
        },
        updateShowNOC: (state, action: PayloadAction<{ noc: NOC; selected: boolean }>) => {
            if (action.payload.noc === NOC.NOC0) {
                state.showNOC0 = action.payload.selected;
            }
            if (action.payload.noc === NOC.NOC1) {
                state.showNOC1 = action.payload.selected;
            }
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
    loadLinkData,
    updateTotalOPs,
    updateLinkSaturation,
    updateCLK,
    updateDRAMBandwidth,
    updatePCIBandwidth,
    updateShowLinkSaturation,
    updateShowNOC,
} = linkSaturationSlice.actions;

export const linkSaturationReducer = linkSaturationSlice.reducer;
