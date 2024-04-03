/**
 * SPDX-License-Identifier: Apache-2.0
 * SPDX-FileCopyrightText: © 2024 Tenstorrent Inc.
 */

import { RootState } from '../createStore';

export const getLinkData = (graphName: string, id: string) => (state: RootState) =>
    state.linkSaturation.graphs[graphName]?.links[id];
export const getAllLinksForGraph = (graphName: string) => (state: RootState) =>
    state.linkSaturation.graphs[graphName]?.links || [];
export const getTotalOpsForGraph = (graphName: string) => (state: RootState) =>
    state.linkSaturation.graphs[graphName]?.totalOps || 0;
export const getEpochNormalizedTotalOps = (state: RootState) => state.linkSaturation.epochNormalizedTotalOps;
export const getEpochAdjustedTotalOps = (state: RootState) => state.linkSaturation.epochAdjustedTotalOps;
export const getLinkSaturation = (state: RootState) => state.linkSaturation.linkSaturationTreshold;
export const getShowLinkSaturation = (state: RootState) => state.linkSaturation.showLinkSaturation;
export const getShowNOC0 = (state: RootState) => state.linkSaturation.showNOC0;
export const getShowNOC1 = (state: RootState) => state.linkSaturation.showNOC1;
export const getDRAMBandwidth = (state: RootState) => state.linkSaturation.DRAMBandwidthGBs;
export const getPCIBandwidth = (state: RootState) => state.linkSaturation.PCIBandwidthGBs;
export const getCLKMhz = (state: RootState) => state.linkSaturation.CLKMHz;
