// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent Inc.

import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { NodeSelectionState } from 'data/StateTypes';
import { GraphVertexType } from '../../GraphNames';
import type { NodeInitialState } from '../../GraphOnChip';

const nodesInitialState: NodeSelectionState = {
    nodeList: {},
    selectedNodeList: {},
    dramNodesHighlight: {},
    operands: {},
    focusNode: null,
};

const nodeSelectionSlice = createSlice({
    name: 'nodeSelection',
    initialState: nodesInitialState,
    reducers: {
        initialLoadAllNodesData(state, action: PayloadAction<Record<number, NodeInitialState[]>>) {
            state.nodeList = {};
            state.selectedNodeList = {};
            state.operands = {};
            state.dramNodesHighlight = {};
            state.focusNode = null;

            Object.entries(action.payload).forEach(([temporalEpoch, computeNodeStateList]) => {
                // Object.entries always return the key converted to string, we convert epoch back to a number here
                const epochNumber = Number.parseInt(temporalEpoch, 10);

                state.nodeList[epochNumber] = {};
                state.selectedNodeList[epochNumber] = [];
                state.dramNodesHighlight[epochNumber] = {};

                computeNodeStateList.forEach((item) => {
                    state.nodeList[epochNumber][item.id] = {
                        id: item.id,
                        opName: item.opName,
                        queueNameList: item.queueNameList,
                        selected: false,
                        graphName: item.graphName,
                    };

                    if (item.dramChannelId !== -1) {
                        const dramGroup = action.payload[epochNumber]
                            .filter(
                                ({ dramChannelId, graphName }) =>
                                    dramChannelId === item.dramChannelId && graphName === item.graphName,
                            )
                            .map(({ id }) => id);

                        state.nodeList[epochNumber][item.id].dramGroup = dramGroup;
                        state.dramNodesHighlight[epochNumber][item.id] = false;
                    }

                    if (item.queueNameList.length > 0) {
                        item.queueNameList.forEach((queueName) => {
                            if (!state.operands[queueName]) {
                                state.operands[queueName] = {
                                    selected: false,
                                    type: GraphVertexType.QUEUE,
                                    graphName: item.graphName,
                                };
                            }
                        });
                    }

                    if (item.opName !== '') {
                        if (!state.operands[item.opName]) {
                            state.operands[item.opName] = {
                                selected: false,
                                type: GraphVertexType.OPERATION,
                                graphName: item.graphName,
                            };
                        }
                    }
                });
            });
        },

        updateNodeSelection(state, action: PayloadAction<{ temporalEpoch: number; id: string; selected: boolean }>) {
            const { temporalEpoch, id, selected } = action.payload;
            const node = state.nodeList?.[temporalEpoch]?.[id];

            if (!node) {
                return;
            }

            node.selected = selected;

            const nodeIndex = state.selectedNodeList[temporalEpoch].indexOf(id);
            if (nodeIndex > -1 && !selected) {
                state.selectedNodeList[temporalEpoch] = [...state.selectedNodeList[temporalEpoch]].toSpliced(
                    nodeIndex,
                    1,
                );
            }

            if (nodeIndex === -1 && selected) {
                state.selectedNodeList[temporalEpoch] = [...state.selectedNodeList[temporalEpoch], id];
            }

            const shouldKeepHighlighted =
                state.nodeList[temporalEpoch][id].dramGroup?.some(
                    (dramId) => state.nodeList[temporalEpoch][dramId].selected,
                ) ?? false;

            state.nodeList[temporalEpoch][id].dramGroup?.forEach((dramId) => {
                state.dramNodesHighlight[temporalEpoch][dramId] = shouldKeepHighlighted || selected;
            });
        },
        selectOperandList(state, action: PayloadAction<{ operands: string[]; selected: boolean }>) {
            const { operands: operandsToSelect, selected } = action.payload;

            operandsToSelect.forEach((operandName) => {
                if (state.operands[operandName]) {
                    state.operands[operandName].selected = selected;
                }
            });
        },
        selectAllOperationsForGraph(state, action: PayloadAction<string>) {
            Object.values(state.operands).forEach((operand) => {
                const isOperation = operand.type === GraphVertexType.OPERATION;
                const isOnGraph = operand.graphName === action.payload;

                if (isOperation && isOnGraph) {
                    operand.selected = true;
                }
            });
        },
        clearAllOperationsForGraph(state, action: PayloadAction<string>) {
            Object.values(state.operands).forEach((operand) => {
                const isOperation = operand.type === GraphVertexType.OPERATION;
                const isOnGraph = operand.graphName === action.payload;

                if (isOperation && isOnGraph) {
                    operand.selected = false;
                }
            });
        },
        selectOperand(state, action: PayloadAction<{ operandName: string; selected: boolean }>) {
            const { operandName, selected } = action.payload;

            if (state.operands[operandName]) {
                state.operands[operandName].selected = selected;
            }
        },
        selectAllQueuesForGraph(state, action: PayloadAction<string>) {
            Object.values(state.operands).forEach((operand) => {
                const isOperation = operand.type === GraphVertexType.QUEUE;
                const isOnGraph = operand.graphName === action.payload;

                if (isOperation && isOnGraph) {
                    operand.selected = true;
                }
            });
        },
        clearAllQueuesforGraph(state, action: PayloadAction<string>) {
            Object.values(state.operands).forEach((operand) => {
                const isOperation = operand.type === GraphVertexType.QUEUE;
                const isOnGraph = operand.graphName === action.payload;

                if (isOperation && isOnGraph) {
                    operand.selected = false;
                }
            });
        },
        updateFocusNode(state, action: PayloadAction<string | null>) {
            state.focusNode = action.payload;
        },
    },
});

export const {
    //
    initialLoadAllNodesData,
    updateNodeSelection,
    selectOperandList,
    selectAllOperationsForGraph,
    clearAllOperationsForGraph,
    selectOperand,
    selectAllQueuesForGraph,
    clearAllQueuesforGraph,
    updateFocusNode,
} = nodeSelectionSlice.actions;

export const nodeSelectionReducer = nodeSelectionSlice.reducer;
