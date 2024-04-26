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

const findSiblingNodeLocations = (node: ComputeNodeState, nodes: ComputeNodeState[]) => {
    const top = nodes
        .filter((n) => n.loc.x === node.loc.x && n.loc.y <= node.loc.y - 1)
        .sort((a, b) => b.loc.y - a.loc.y)[0]?.loc;
    const bottom = nodes
        .filter((n) => n.loc.x === node.loc.x && n.loc.y >= node.loc.y + 1)
        .sort((a, b) => a.loc.y - b.loc.y)[0]?.loc;
    const left = nodes
        .filter((n) => n.loc.y === node.loc.y && n.loc.x <= node.loc.x - 1)
        .sort((a, b) => b.loc.x - a.loc.x)[0]?.loc;
    const right = nodes
        .filter((n) => n.loc.y === node.loc.y && n.loc.x >= node.loc.x + 1)
        .sort((a, b) => a.loc.x - b.loc.x)[0]?.loc;

    return {
        top,
        bottom,
        left,
        right,
    };
};

const setSiblings = (nodes: ComputeNodeState[]) => {
    nodes.forEach((node) => {
        node.siblings = findSiblingNodeLocations(node, nodes);
    });
};

const setBorders = (nodes: ComputeNodeState[]) => {
    const locations = new Set(nodes.map((node) => JSON.stringify(node.loc)));
    nodes.forEach((node) => {
        const leftLoc = { x: node.loc.x - 1, y: node.loc.y };
        const rightLoc = { x: node.loc.x + 1, y: node.loc.y };
        const topLoc = { x: node.loc.x, y: node.loc.y - 1 };
        const bottomLoc = { x: node.loc.x, y: node.loc.y + 1 };
        node.border = {
            left: !locations.has(JSON.stringify(leftLoc)),
            right: !locations.has(JSON.stringify(rightLoc)),
            top: !locations.has(JSON.stringify(topLoc)),
            bottom: !locations.has(JSON.stringify(bottomLoc)),
        };
    });
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
                                    data: [],
                                    selected: false,
                                    type: GraphVertexType.QUEUE,
                                    graphName,
                                };
                            }

                            state.operands[queueName].data.push(item);
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
                                data: [],
                                selected: false,
                                type: GraphVertexType.OPERATION,
                                graphName,
                            };
                        }

                        state.operands[item.opName].data.push(item);
                    }
                });

                state.dram[graphName].forEach((dramElement) => {
                    setBorders(dramElement.data);
                });

                Object.values(state.operands).forEach((operand) => {
                    setSiblings(operand.data);
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

            Object.entries(state.operands).forEach(([operandName, operand]) => {
                if (operandsToSelect.includes(operandName)) {
                    operand.selected = selected;
                }
            });
        },
        selectAllOperations(state, action: PayloadAction<string>) {
            Object.values(state.operands).forEach((operand) => {
                const isOperation = operand.type === GraphVertexType.OPERATION;
                const isOnGraph = operand.graphName === action.payload;

                if (isOperation && isOnGraph) {
                    operand.selected = true;
                }
            });
        },
        clearAllOperations(state, action: PayloadAction<string>) {
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
        selectAllQueues(state, action: PayloadAction<string>) {
            Object.values(state.operands).forEach((operand) => {
                const isOperation = operand.type === GraphVertexType.QUEUE;
                const isOnGraph = operand.graphName === action.payload;

                if (isOperation && isOnGraph) {
                    operand.selected = true;
                }
            });
        },
        clearAllQueues(state, action: PayloadAction<string>) {
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
    selectAllOperations,
    clearAllOperations,
    selectOperand,
    selectAllQueues,
    clearAllQueues,
    updateFocusNode,
} = nodeSelectionSlice.actions;

export const nodeSelectionReducer = nodeSelectionSlice.reducer;
