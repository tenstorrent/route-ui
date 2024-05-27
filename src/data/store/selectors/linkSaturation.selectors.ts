// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent Inc.

import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../createStore';

export const getNodeLinksData = (temporalEpoch: number, nodeUid: string) => (state: RootState) =>
    state.linkSaturation.linksPerTemporalEpoch[temporalEpoch]?.linksPerNodeMap[nodeUid];
export const getOffchipLinkSaturationForNode = (temporalEpoch: number, nodeUid: string) => (state: RootState) =>
    state.linkSaturation.linksPerTemporalEpoch[temporalEpoch]?.linksPerNodeMap[nodeUid]?.offchipSaturation ?? 0;
export const getLinksPerNodeMapForTemporalEpoch = (temporalEpoch: number) => (state: RootState) =>
    state.linkSaturation.linksPerTemporalEpoch[temporalEpoch]?.linksPerNodeMap || {};
export const getTotalOpsForGraph = (temporalEpoch: number) => (state: RootState) =>
    state.linkSaturation.linksPerTemporalEpoch[temporalEpoch]?.totalOps || 0;
export const getEpochNormalizedTotalOps = createSelector(
    (state: RootState) => state.linkSaturation.linksPerTemporalEpoch,
    (linksPerTemporalEpoch) => linksPerTemporalEpoch.map(({ normalizedTotalOps }) => normalizedTotalOps),
);

export const getEpochAdjustedTotalOps = createSelector(
    (state: RootState) => state.linkSaturation.linksPerTemporalEpoch,
    (linksPerTemporalEpoch) => linksPerTemporalEpoch.map(({ adjustedTotalOps }) => adjustedTotalOps),
);
export const getLinkSaturation = (state: RootState) => state.linkSaturation.linkSaturationTreshold;
export const getShowLinkSaturation = (state: RootState) => state.linkSaturation.showLinkSaturation;
export const getShowNOC0 = (state: RootState) => state.linkSaturation.showNOC0;
export const getShowNOC1 = (state: RootState) => state.linkSaturation.showNOC1;
export const getDRAMBandwidth = (state: RootState) => state.linkSaturation.DRAMBandwidthGBs;
export const getPCIBandwidth = (state: RootState) => state.linkSaturation.PCIBandwidthGBs;
export const getCLKMhz = (state: RootState) => state.linkSaturation.CLKMHz;
