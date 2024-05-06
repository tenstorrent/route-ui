// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent Inc.

import { RootState } from '../createStore';

export const getDramGroup = (temporalEpoch: number, graphName: string, dramChannelId?: number) => (state: RootState) =>
    state.nodeSelection.dram[temporalEpoch][graphName]?.[dramChannelId ?? -1];

export const selectNodeSelectionById = (temporalEpoch: number, graphName: string, id: string) => (state: RootState) =>
    state.nodeSelection.nodeList[temporalEpoch][graphName]?.[id];
export const getOperand = (opName: string) => (state: RootState) => state.nodeSelection.operands[opName];
export const getOperandState = (state: RootState) => state.nodeSelection.operands;

export const getOperandStateList = (operandNames: string[]) => (state: RootState) =>
    operandNames.map((name) => state.nodeSelection.operands[name]);

export const getOperandStatesRecord = (operandNames: string[]) => (state: RootState) =>
    operandNames.reduce((acc, name) => ({ ...acc, [name]: state.nodeSelection.operands[name] }), {});

export const getSelectedNodeList = (temporalEpoch: number) => (state: RootState) =>
    state.nodeSelection.nodeList[temporalEpoch];

export const getOrderedNodeList = (temporalEpoch: number, graphName: string) => (state: RootState) =>
    (state.nodeSelection.nodeListOrder[temporalEpoch][graphName] ?? [])
        .map((id) => state.nodeSelection.nodeList[temporalEpoch][graphName][id])
        .toReversed();

export const getFocusNode = (state: RootState) => state.nodeSelection.focusNode;
