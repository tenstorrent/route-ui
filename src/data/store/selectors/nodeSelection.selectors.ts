// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent Inc.

import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../createStore';

export const getDramGroup = (temporalEpoch: string, id: string) => (state: RootState) =>
    state.nodeSelection.nodeList[temporalEpoch]?.[id]?.dramGroup;

export const selectNodeSelectionById = (graphName: string, id: string) => (state: RootState) =>
    state.nodeSelection.nodeList[graphName]?.[id];
export const getOperand = (opName: string) => (state: RootState) => state.nodeSelection.operands[opName];

export const getOperandState = createSelector(
    (state: RootState) => state.nodeSelection,
    (nodeSelection) => nodeSelection.operands,
);

export const getOperandStateList = (operandNames: string[]) => (state: RootState) =>
    operandNames.map((name) => state.nodeSelection.operands[name]);

export const getOperandStatesRecord = (operandNames: string[]) => (state: RootState) =>
    operandNames.reduce((acc, name) => ({ ...acc, [name]: state.nodeSelection.operands[name] }), {});

export const getSelectedNodeList = (temporalEpoch: string) => (state: RootState) =>
    state.nodeSelection.nodeList[temporalEpoch];

export const getOrderedNodeList = (temporalEpoch: string) => (state: RootState) =>
    (state.nodeSelection.selectedNodeList[temporalEpoch] ?? [])
        .map((id) => state.nodeSelection.nodeList[temporalEpoch][id])
        .toReversed();

export const getFocusNode = (state: RootState) => state.nodeSelection.focusNode;
