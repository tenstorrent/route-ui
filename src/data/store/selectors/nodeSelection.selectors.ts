// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent Inc.

import { RootState } from '../createStore';

export const getDramGroup = (temporalEpoch: number, dramChannelId?: number) => (state: RootState) =>
    dramChannelId !== undefined && dramChannelId > -1
        ? state.nodeSelection.dram[temporalEpoch]?.[dramChannelId]
        : undefined;

export const selectNodeSelectionById = (temporalEpoch: number, id: string) => (state: RootState) =>
    state.nodeSelection.nodeList[temporalEpoch]?.[id];
export const getOperand = (opName: string) => (state: RootState) => state.nodeSelection.operands[opName];
export const getOperandState = (state: RootState) => state.nodeSelection.operands;

export const getSelectedNodeList = (temporalEpoch: number) => (state: RootState) =>
    state.nodeSelection.nodeList[temporalEpoch];

export const getOrderedNodeList = (temporalEpoch: number) => (state: RootState) =>
    (state.nodeSelection.nodeListOrder[temporalEpoch] ?? [])
        .map((id) => state.nodeSelection.nodeList[temporalEpoch][id])
        .toReversed();

export const getFocusNode = (state: RootState) => state.nodeSelection.focusNode;
