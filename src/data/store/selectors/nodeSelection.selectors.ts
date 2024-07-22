// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent AI ULC

import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../createStore';

export const getDramHighlightState = (temporalEpoch: number, id: string) => (state: RootState) =>
    state.nodeSelection.dramNodesHighlight[temporalEpoch]?.[id];

export const selectNodeSelectionById = (temporalEpoch: number, id: string) => (state: RootState) =>
    state.nodeSelection.nodeList[temporalEpoch]?.[id];
export const getOperand = (opName: string) => (state: RootState) => state.nodeSelection.operands[opName];

export const getOperandState = createSelector(
    (state: RootState) => state.nodeSelection,
    (nodeSelection) => nodeSelection.operands,
);

export const getOperandStateList = createSelector(
    (state: RootState) => state.nodeSelection,
    (nodeSelection) => (operandNames: string[]) => operandNames.map((name) => nodeSelection.operands[name]),
);

export const getSelectedNodeList = (temporalEpoch: number) => (state: RootState) =>
    state.nodeSelection.nodeList[temporalEpoch];

export const getOrderedSelectedNodeList = (temporalEpoch: number) => (state: RootState) =>
    (state.nodeSelection.selectedNodeList[temporalEpoch] ?? [])
        .map((id) => state.nodeSelection.nodeList[temporalEpoch]![id]!)
        .toReversed();

export const getFocusNode = (state: RootState) => state.nodeSelection.focusNode;
