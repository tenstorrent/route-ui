// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent Inc.

import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { ComputeNodeState, NodeSelectionState } from 'data/StateTypes';
import { GraphVertexType } from '../../GraphNames';

const nodesInitialState: NodeSelectionState = {
    nodeList: {},
    nodeListOrder: {},
    operands: {},
    dram: {},
    focusNode: null,
};

const nodeSelectionSlice = createSlice({
    name: 'nodeSelection',
    initialState: nodesInitialState,
    reducers: {
        initialLoadAllNodesData(state, action: PayloadAction<Record<string, ComputeNodeState[]>>) {
            state.nodeList = {};
            state.nodeListOrder = {};
            state.operands = {};
            state.dram = {};
            state.focusNode = null;

            Object.entries(action.payload).forEach(([graphName, computeNodeStateList]) => {
                state.dram[graphName] = [];
                state.nodeList[graphName] = {};
                state.nodeListOrder[graphName] = [];

                computeNodeStateList.forEach((item) => {
                    state.nodeList[graphName][item.id] = item;

                    if (item.queueNameList.length > 0) {
                        item.queueNameList.forEach((queueName) => {
                            if (!state.operands[queueName]) {
                                state.operands[queueName] = {
                                    selected: false,
                                    type: GraphVertexType.QUEUE,
                                    graphName,
                                };
                            }
                        });
                    }

                    if (item.dramChannelId !== -1) {
                        if (!state.dram[graphName][item.dramChannelId]) {
                            state.dram[graphName][item.dramChannelId] = { data: [], selected: false };
                        }
                        state.dram[graphName][item.dramChannelId].data.push(item);
                    }

                    if (item.opName !== '') {
                        if (!state.operands[item.opName]) {
                            state.operands[item.opName] = {
                                selected: false,
                                type: GraphVertexType.OPERATION,
                                graphName,
                            };
                        }
                    }
                });
            });
        },

        updateNodeSelection(state, action: PayloadAction<{ graphName: string; id: string; selected: boolean }>) {
            const { graphName, id, selected } = action.payload;
            const node: ComputeNodeState | undefined = state.nodeList[graphName][id];

            if (node) {
                node.selected = selected;
            }

            const nodeIndex = state.nodeListOrder[graphName].indexOf(id);
            if (nodeIndex > -1 && !selected) {
                state.nodeListOrder[graphName] = [...state.nodeListOrder[graphName]].toSpliced(nodeIndex, 1);
            }

            if (nodeIndex === -1 && selected) {
                state.nodeListOrder[graphName] = [...state.nodeListOrder[graphName], id];
            }

            state.dram[graphName].forEach((dramGroup) => {
                const hasSelectedNode = dramGroup.data.some((n) => state.nodeList[graphName][n.id].selected);

                if (hasSelectedNode) {
                    dramGroup.selected = true;
                } else {
                    dramGroup.selected = false;
                }
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
