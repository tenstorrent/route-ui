/**
 * SPDX-License-Identifier: Apache-2.0
 * SPDX-FileCopyrightText: © 2024 Tenstorrent Inc.
 */

import { RootState } from '../createStore';

export const getDramGroup = (graphName: string, id: number | undefined) => (state: RootState) =>
    id !== undefined && id > -1 ? state.nodeSelection.dram[graphName][id] : null;

export const selectNodeSelectionById = (graphName: string, id: string) => (state: RootState) =>
    state.nodeSelection.nodeList[graphName]?.[id];
export const getOperation = (graphName: string, opName: string) => (state: RootState) =>
    state.nodeSelection.operations[graphName]?.[opName];
export const getSelectedOperationList = (graphName: string) => (state: RootState) =>
    state.nodeSelection.operations[graphName];

export const getSelectedQueueList = (graphName: string) => (state: RootState) => state.nodeSelection.queues[graphName];

export const getSelectedNodeList = (graphName: string) => (state: RootState) => state.nodeSelection.nodeList[graphName];

export const getOrderedNodeList = (graphName: string) => (state: RootState) =>
    state.nodeSelection.nodeListOrder[graphName].map((id) => state.nodeSelection.nodeList[graphName][id]).toReversed();

export const getFocusNode = (state: RootState) => state.nodeSelection.focusNode;
