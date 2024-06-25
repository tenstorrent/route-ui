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
                Object.entries(temporalEpochState.linksStateCongestionByNode).forEach(
                    ([nodeUid, { linksByLinkId: links, offchipLinkIds }]) => {
                        Object.values(links).forEach((linkState) => {
                            if (linkState.type === LinkType.ETHERNET) {
                                linkState.maxBandwidth = ETH_BANDWIDTH_INITIAL_GBS;
                            } else if (linkState.type === LinkType.DRAM) {
                                linkState.maxBandwidth = DRAMBandwidthBytes / CLKHz;
                            } else if (linkState.type === LinkType.PCIE) {
                                linkState.maxBandwidth = PCIBandwidthGBs / CLKHz;
                            }
                            const { bpc, linkSaturation, maxLinkSaturation, offchipMaxSaturation } =
                                INTERNAL_calculateLinkSaturationMetrics({
                                    link: linkState,
                                    totalOpCycles: totalOps,
                                    linkListByLinkId: links,
                                    offchipLinkIds,
                                });

                            linkState.bpc = bpc;
                            linkState.saturation = linkSaturation;
                            temporalEpochState.linksStateCongestionByNode[nodeUid].maxLinkSaturation =
                                maxLinkSaturation;
                            temporalEpochState.linksStateCongestionByNode[nodeUid].offchipMaxSaturation =
                                offchipMaxSaturation;
                        });
                    },
                );
            }
        },
        updateEpochNormalizedOP: (state, action: PayloadAction<{ epoch: number; updatedValue: number }>) => {
            const { epoch, updatedValue } = action.payload;
            state.linksPerTemporalEpoch[epoch].normalizedTotalOps = updatedValue;

            Object.values(state.linksPerTemporalEpoch[epoch].linksStateCongestionByNode).forEach(
                ({ linksByLinkId: links }) => {
                    Object.values(links).forEach((linkState) => {
                        if (linkState.type === LinkType.ETHERNET) {
                            linkState.normalizedSaturation = calculateNormalizedSaturation(linkState, updatedValue);
                        }
                    });
                },
            );
        },
        initialLoadLinkData: (state, action: PayloadAction<NetworkCongestionState['linksPerTemporalEpoch']>) => {
            state.linksPerTemporalEpoch = action.payload;

            action.payload.forEach(({ linksStateCongestionByNode, normalizedTotalOps, totalOpPerChip }) => {
                const { DRAMBandwidthBytes, PCIBandwidthGBs, CLKHz } = getInitialCLKValues(state);

                Object.entries(linksStateCongestionByNode).forEach(
                    ([nodeUid, { linksByLinkId: links, chipId, offchipLinkIds }]) => {
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

                            const { bpc, linkSaturation, maxLinkSaturation, offchipMaxSaturation } =
                                INTERNAL_calculateLinkSaturationMetrics({
                                    link: linkState,
                                    totalOpCycles: totalOpPerChip[chipId],
                                    linkListByLinkId: links,
                                    offchipLinkIds,
                                });

                            linkState.bpc = bpc;
                            linkState.saturation = linkSaturation;
                            linksStateCongestionByNode[nodeUid].maxLinkSaturation = maxLinkSaturation;
                            linksStateCongestionByNode[nodeUid].offchipMaxSaturation = offchipMaxSaturation;
                        });
                    },
                );
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
        Object.entries(epochState.linksStateCongestionByNode).forEach(
            ([nodeUid, { linksByLinkId: links, offchipLinkIds }]) => {
                Object.values(links).forEach((linkState) => {
                    if (linkState.type === LinkType.DRAM) {
                        linkState.maxBandwidth = DRAMBandwidthBytes / CLKHz;
                        const { bpc, linkSaturation, maxLinkSaturation, offchipMaxSaturation } =
                            INTERNAL_calculateLinkSaturationMetrics({
                                link: linkState,
                                totalOpCycles: epochState.totalOps,
                                linkListByLinkId: links,
                                offchipLinkIds,
                            });

                        linkState.bpc = bpc;
                        linkState.saturation = linkSaturation;
                        epochState.linksStateCongestionByNode[nodeUid].maxLinkSaturation = maxLinkSaturation;
                        epochState.linksStateCongestionByNode[nodeUid].offchipMaxSaturation = offchipMaxSaturation;
                    }
                });
            },
        );
    });
};

const updatePCILinks = (state: NetworkCongestionState) => {
    const { PCIBandwidthGBs, CLKHz } = getInitialCLKValues(state);

    Object.values(state.linksPerTemporalEpoch).forEach((epochState) => {
        Object.entries(epochState.linksStateCongestionByNode).forEach(
            ([nodeUid, { linksByLinkId: links, offchipLinkIds }]) => {
                Object.values(links).forEach((linkState) => {
                    if (linkState.type === LinkType.PCIE) {
                        linkState.maxBandwidth = PCIBandwidthGBs / CLKHz;
                        const { bpc, linkSaturation, maxLinkSaturation, offchipMaxSaturation } =
                            INTERNAL_calculateLinkSaturationMetrics({
                                link: linkState,
                                totalOpCycles: epochState.totalOps,
                                linkListByLinkId: links,
                                offchipLinkIds,
                            });

                        linkState.bpc = bpc;
                        linkState.saturation = linkSaturation;
                        epochState.linksStateCongestionByNode[nodeUid].maxLinkSaturation = maxLinkSaturation;
                        epochState.linksStateCongestionByNode[nodeUid].offchipMaxSaturation = offchipMaxSaturation;
                    }
                });
            },
        );
    });
};

interface INTERNAL_LinkStaturationMetrics {
    link: LinkState;
    totalOpCycles: number;
    linkListByLinkId: Record<string, LinkState>;
    offchipLinkIds: string[];
}

const INTERNAL_calculateLinkSaturationMetrics = ({
    link,
    totalOpCycles,
    linkListByLinkId,
    offchipLinkIds,
}: INTERNAL_LinkStaturationMetrics) => {
    const newLinkSaturation = (link.bpc / link.maxBandwidth) * 100;

    return {
        bpc: link.totalDataBytes / totalOpCycles,
        linkSaturation: newLinkSaturation,
        ...Object.entries(linkListByLinkId).reduce(
            (updatedSaturation, [linkId, { saturation }]) => {
                if (linkId !== link.id) {
                    updatedSaturation.maxLinkSaturation = Math.max(updatedSaturation.maxLinkSaturation, saturation);

                    if (offchipLinkIds.includes(linkId)) {
                        updatedSaturation.offchipMaxSaturation = Math.max(
                            updatedSaturation.offchipMaxSaturation,
                            saturation,
                        );
                    }
                }

                return updatedSaturation;
            },
            {
                maxLinkSaturation: newLinkSaturation,
                offchipMaxSaturation: newLinkSaturation,
            },
        ),
    };
};

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

export const calculateMaxLinkSaturation = (
    linkUid: string,
    linkSaturation: number,
    linkListByLinkId: Record<string, LinkState>,
) => {
    return Object.entries(linkListByLinkId).reduce((updatedSaturation, [linkId, { saturation }]) => {
        if (linkId !== linkUid) {
            return Math.max(updatedSaturation, saturation);
        }

        return updatedSaturation;
    }, linkSaturation);
};

export const calculateOffchipMaxSaturation = (
    linkUid: string,
    linkSaturation: number,
    linkListByLinkId: Record<string, LinkState>,
    offchipLinkIds: string[],
) => {
    return Object.entries(linkListByLinkId).reduce((updatedSaturation, [linkId, { saturation }]) => {
        if (linkId !== linkUid && offchipLinkIds.includes(linkId)) {
            return Math.max(updatedSaturation, saturation);
        }

        return updatedSaturation;
    }, linkSaturation);
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
