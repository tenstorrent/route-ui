/**
 * SPDX-License-Identifier: Apache-2.0
 * SPDX-FileCopyrightText: © 2024 Tenstorrent Inc.
 */

import { RootState } from '../createStore';

export const getDramGroup = (id: number | undefined) => (state: RootState) =>
    id !== undefined && id > -1 ? state.nodeSelection.dram[id] : null;

export const selectNodeSelectionById = (id: string) => (state: RootState) => state.nodeSelection.nodeList[id];
export const getOperation = (id: string) => (state: RootState) => state.nodeSelection.operations[id];
export const getSelectedOperationList = (state: RootState) => state.nodeSelection.operations;

export const getSelectedQueueList = (graphName: string) => (state: RootState) => state.nodeSelection.queues[graphName];

export const getSelectedNodeList = (state: RootState) => state.nodeSelection.nodeList;

export const getOrderedNodeList = (state: RootState) =>
    state.nodeSelection.nodeListOrder.map((id) => state.nodeSelection.nodeList[id]).toReversed();

export const getFocusNode = (state: RootState) => state.nodeSelection.focusNode;
