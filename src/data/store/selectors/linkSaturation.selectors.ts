// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent AI ULC

import { RootState } from '../createStore';

export const getTotalOps = (temporalEpoch: number, chipId?: number) => (state: RootState) =>
    (chipId !== undefined
        ? state.linkSaturation.linksPerTemporalEpoch[temporalEpoch]?.chipTotalOps?.[chipId]
        : state.linkSaturation.linksPerTemporalEpoch[temporalEpoch]?.totalOps) || 0;
export const getTotalOpsList = (temporalEpoch: number) => (state: RootState) =>
    state.linkSaturation.linksPerTemporalEpoch[temporalEpoch].chipTotalOps;
export const getEpochNormalizedTotalOps = (temporalEpoch: number) => (state: RootState) =>
    state.linkSaturation.linksPerTemporalEpoch[temporalEpoch].normalizedTotalOps;

export const getEpochInitialNormalizedTotalOps = (temporalEpoch: number) => (state: RootState) =>
    state.linkSaturation.linksPerTemporalEpoch[temporalEpoch].initialNormalizedTotalOps;
export const getLinkSaturation = (state: RootState) => state.linkSaturation.linkSaturationTreshold;
export const getShowLinkSaturation = (state: RootState) => state.linkSaturation.showLinkSaturation;
export const getShowNOC0 = (state: RootState) => state.linkSaturation.showNOC0;
export const getShowNOC1 = (state: RootState) => state.linkSaturation.showNOC1;
export const getDRAMBandwidth = (state: RootState) => state.linkSaturation.DRAMBandwidthGBs;
export const getPCIBandwidth = (state: RootState) => state.linkSaturation.PCIBandwidthGBs;
export const getCLKMhz = (state: RootState) => state.linkSaturation.CLKMHz;
