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
    linksPerTemporalEpoch: [],
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
            const temporalEpochState = state.linksPerTemporalEpoch[temporalEpoch];
            const { DRAMBandwidthBytes, PCIBandwidthGBs, CLKHz } = getInitialCLKValues(state);

            if (temporalEpochState) {
                temporalEpochState.totalOps = totalOps;
                Object.entries(temporalEpochState.linksPerNodeMap).forEach(([nodeUid, { links, offchipLinkIds }]) => {
                    Object.values(links).forEach((linkState) => {
                        if (linkState.type === LinkType.ETHERNET) {
                            linkState.maxBandwidth = ETH_BANDWIDTH_INITIAL_GBS;
                        } else if (linkState.type === LinkType.DRAM) {
                            linkState.maxBandwidth = DRAMBandwidthBytes / CLKHz;
                        } else if (linkState.type === LinkType.PCIE) {
                            linkState.maxBandwidth = PCIBandwidthGBs / CLKHz;
                        }
                        const { bpc, linkSaturation, nodeSaturation, offChipSaturation } = recalculateLinkSaturation({
                            link: linkState,
                            totalOpCycles: totalOps,
                            links,
                            offchipLinkIds,
                        });

                        linkState.bpc = bpc;
                        linkState.saturation = linkSaturation;
                        temporalEpochState.linksPerNodeMap[nodeUid].saturation = nodeSaturation;
                        temporalEpochState.linksPerNodeMap[nodeUid].offchipSaturation = offChipSaturation;
                    });
                });
            }
        },
        updateEpochNormalizedOP: (state, action: PayloadAction<{ epoch: number; updatedValue: number }>) => {
            const { epoch, updatedValue } = action.payload;
            state.linksPerTemporalEpoch[epoch].normalizedTotalOps = updatedValue;

            Object.values(state.linksPerTemporalEpoch[epoch].linksPerNodeMap).forEach(({ links }) => {
                Object.values(links).forEach((linkState) => {
                    if (linkState.type === LinkType.ETHERNET) {
                        linkState.normalizedSaturation = calculateNormalizedSaturation(linkState, updatedValue);
                    }
                });
            });
        },
        initialLoadLinkData: (state, action: PayloadAction<NetworkCongestionState['linksPerTemporalEpoch']>) => {
            state.linksPerTemporalEpoch = action.payload;

            action.payload.forEach(({ linksPerNodeMap, normalizedTotalOps, totalOpPerChip }, temporalEpoch) => {
                const { DRAMBandwidthBytes, PCIBandwidthGBs, CLKHz } = getInitialCLKValues(state);

                Object.entries(linksPerNodeMap).forEach(([nodeUid, { links, chipId, offchipLinkIds }]) => {
                    state.linksPerTemporalEpoch[temporalEpoch].allLinks = {
                        ...state.linksPerTemporalEpoch[temporalEpoch].allLinks,
                        ...links,
                    };

                    Object.values(links).forEach((linkState) => {
                        if (linkState.type === LinkType.ETHERNET) {
                            linkState.maxBandwidth = ETH_BANDWIDTH_INITIAL_GBS;
                            linkState.normalizedSaturation = calculateNormalizedSaturation(
                                linkState,
                                normalizedTotalOps,
                            );
                        } else if (linkState.type === LinkType.DRAM) {
                            linkState.maxBandwidth = DRAMBandwidthBytes / CLKHz;
                        } else if (linkState.type === LinkType.PCIE) {
                            linkState.maxBandwidth = PCIBandwidthGBs / CLKHz;
                        }

                        if (linkState.bpc === 0 && linkState.totalDataBytes > 0) {
                            linkState.bpc = linkState.totalDataBytes / totalOpPerChip[chipId];
                        }

                        const { bpc, linkSaturation, nodeSaturation, offChipSaturation } = recalculateLinkSaturation({
                            link: linkState,
                            totalOpCycles: totalOpPerChip[chipId],
                            links,
                            offchipLinkIds,
                        });

                        linkState.bpc = bpc;
                        linkState.saturation = linkSaturation;
                        linksPerNodeMap[nodeUid].saturation = nodeSaturation;
                        linksPerNodeMap[nodeUid].offchipSaturation = offChipSaturation;
                    });
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
            state.linksPerTemporalEpoch = [];
        },
    },
});

const updateDRAMLinks = (state: NetworkCongestionState) => {
    const { DRAMBandwidthBytes, CLKHz } = getInitialCLKValues(state);

    Object.values(state.linksPerTemporalEpoch).forEach((epochState) => {
        Object.entries(epochState.linksPerNodeMap).forEach(([nodeUid, { links, offchipLinkIds }]) => {
            Object.values(links).forEach((linkState) => {
                if (linkState.type === LinkType.DRAM) {
                    linkState.maxBandwidth = DRAMBandwidthBytes / CLKHz;
                    const { bpc, linkSaturation, nodeSaturation, offChipSaturation } = recalculateLinkSaturation({
                        link: linkState,
                        totalOpCycles: epochState.totalOps,
                        links,
                        offchipLinkIds,
                    });

                    linkState.bpc = bpc;
                    linkState.saturation = linkSaturation;
                    epochState.linksPerNodeMap[nodeUid].saturation = nodeSaturation;
                    epochState.linksPerNodeMap[nodeUid].offchipSaturation = offChipSaturation;
                }
            });
        });
    });
};

const updatePCILinks = (state: NetworkCongestionState) => {
    const { PCIBandwidthGBs, CLKHz } = getInitialCLKValues(state);

    Object.values(state.linksPerTemporalEpoch).forEach((epochState) => {
        Object.entries(epochState.linksPerNodeMap).forEach(([nodeUid, { links, offchipLinkIds }]) => {
            Object.values(links).forEach((linkState) => {
                if (linkState.type === LinkType.PCIE) {
                    linkState.maxBandwidth = PCIBandwidthGBs / CLKHz;
                    const { bpc, linkSaturation, nodeSaturation, offChipSaturation } = recalculateLinkSaturation({
                        link: linkState,
                        totalOpCycles: epochState.totalOps,
                        links,
                        offchipLinkIds,
                    });

                    linkState.bpc = bpc;
                    linkState.saturation = linkSaturation;
                    epochState.linksPerNodeMap[nodeUid].saturation = nodeSaturation;
                    epochState.linksPerNodeMap[nodeUid].offchipSaturation = offChipSaturation;
                }
            });
        });
    });
};

const recalculateLinkSaturation = ({
    link,
    totalOpCycles,
    links,
    offchipLinkIds,
}: {
    link: LinkState;
    totalOpCycles: number;
    links: Record<string, LinkState>;
    offchipLinkIds: string[];
}) => {
    const newLinkSaturation = (link.bpc / link.maxBandwidth) * 100;

    return {
        bpc: link.totalDataBytes / totalOpCycles,
        linkSaturation: newLinkSaturation,
        ...Object.entries(links).reduce(
            (updatedSaturation, [linkId, { saturation }]) => {
                if (linkId !== link.id) {
                    updatedSaturation.nodeSaturation = Math.max(updatedSaturation.nodeSaturation, saturation);

                    if (offchipLinkIds.includes(linkId)) {
                        updatedSaturation.offChipSaturation = Math.max(updatedSaturation.offChipSaturation, saturation);
                    }
                }

                return updatedSaturation;
            },
            {
                nodeSaturation: newLinkSaturation,
                offChipSaturation: newLinkSaturation,
            },
        ),
    };
};

const calculateNormalizedSaturation = (link: LinkState, normalizedOpCycles: number) => {
    const bpc = link.totalDataBytes / normalizedOpCycles;

    return (bpc / link.maxBandwidth) * 100;
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
