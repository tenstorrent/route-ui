// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent Inc.

import { RootState } from '../createStore';

export const getDramGroup = (graphName: string, dramChannelId?: number) => (state: RootState) =>
    dramChannelId !== undefined && dramChannelId > -1
        ? state.nodeSelection.dram[graphName]?.[dramChannelId]
        : undefined;

export const selectNodeSelectionById = (graphName: string, id: string) => (state: RootState) =>
    state.nodeSelection.nodeList[graphName]?.[id];
export const getOperand = (opName: string) => (state: RootState) => state.nodeSelection.operands[opName];
export const getOperandState = (state: RootState) => state.nodeSelection.operands;

export const getOperandStateList = (operandNames: string[]) => (state: RootState) =>
    operandNames.map((name) => state.nodeSelection.operands[name]);

export const getOperandStatesRecord = (operandNames: string[]) => (state: RootState) =>
    operandNames.reduce((acc, name) => ({ ...acc, [name]: state.nodeSelection.operands[name] }), {});

export const getSelectedNodeList = (graphName: string) => (state: RootState) => state.nodeSelection.nodeList[graphName];

export const getOrderedNodeList = (graphName: string) => (state: RootState) =>
    (state.nodeSelection.nodeListOrder[graphName] ?? [])
        .map((id) => state.nodeSelection.nodeList[graphName][id])
        .toReversed();

export const getFocusNode = (state: RootState) => state.nodeSelection.focusNode;
