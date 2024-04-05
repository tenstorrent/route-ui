/**
 * SPDX-License-Identifier: Apache-2.0
 * SPDX-FileCopyrightText: © 2024 Tenstorrent Inc.
 */

import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { ComputeNodeState, NodeSelectionState } from 'data/StateTypes';

const nodesInitialState: NodeSelectionState = {
    nodeList: {},
    nodeListOrder: [],
    operations: {},
    queues: {},
    dram: [],
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
        loadNodesData(state, action: PayloadAction<ComputeNodeState[]>) {
            state.nodeList = {};
            state.dram = [];

            action.payload.forEach((item) => {
                state.nodeList[item.id] = item;

                if (item.dramChannelId !== -1) {
                    if (!state.dram[item.dramChannelId]) {
                        state.dram[item.dramChannelId] = { data: [], selected: false };
                    }
                    state.dram[item.dramChannelId].data.push(item);
                }
            });

            state.dram.forEach((dramElement) => {
                setBorders(dramElement.data);
            });
        },
        initialLoadQueues(state, action: PayloadAction<Record<string, ComputeNodeState[]>>) {
            Object.entries(action.payload).forEach(([graphName, computaNodeStateList]) => {
                state.queues[graphName] = {};

                computaNodeStateList.forEach((item) => {
                    if (item.queueNameList.length > 0) {
                        item.queueNameList.forEach((queueName) => {
                            if (!state.queues[graphName][queueName]) {
                                state.queues[graphName][queueName] = { data: [], selected: false };
                            }
                            state.queues[graphName][queueName].data.push(item);
                        });
                    }
                });

                Object.values(state.queues[graphName]).forEach((queue) => {
                    setSiblings(queue.data);
                });
            });
        },
        initialLoadOPs(state, action: PayloadAction<Record<string, ComputeNodeState[]>>) {
            Object.entries(action.payload).forEach(([graphName, computaNodeStateList]) => {
                state.operations[graphName] = {};

                computaNodeStateList.forEach((item) => {
                    if (item.opName !== '') {
                        if (!state.operations[graphName][item.opName]) {
                            state.operations[graphName][item.opName] = { data: [], selected: false };
                        }
                        state.operations[graphName][item.opName].data.push(item);
                    }
                });

                Object.values(state.operations[graphName]).forEach((operation) => {
                    setSiblings(operation.data);
                });
            });
        },

        updateNodeSelection(state, action: PayloadAction<{ id: string; selected: boolean }>) {
            const { id, selected } = action.payload;
            const node: ComputeNodeState | undefined = state.nodeList[id];

            if (node) {
                node.selected = selected;
            }

            const nodeIndex = state.nodeListOrder.indexOf(id);
            if (nodeIndex > -1 && !selected) {
                state.nodeListOrder = [...state.nodeListOrder].toSpliced(nodeIndex, 1);
            }

            if (nodeIndex === -1 && selected) {
                state.nodeListOrder = [...state.nodeListOrder, id];
            }

            state.dram.forEach((dramGroup) => {
                const hasSelectedNode = dramGroup.data.some((n) => state.nodeList[n.id].selected);

                if (hasSelectedNode) {
                    dramGroup.selected = true;
                } else {
                    dramGroup.selected = false;
                }
            });
        },
        clearAllNodes(state) {
            Object.values(state.nodeList).forEach((node) => {
                node.selected = false;
            });

            state.nodeListOrder = [];

            state.dram.forEach((dramGroup) => {
                dramGroup.selected = false;
            });
        },
        selectOperation(state, action: PayloadAction<{ graphName: string; opName: string; selected: boolean }>) {
            const { graphName, opName, selected } = action.payload;
            const operation = state.operations[graphName][opName];

            if (operation) {
                operation.selected = selected;
            }
        },
        selectAllOperations(state, action: PayloadAction<string>) {
            Object.values(state.operations[action.payload]).forEach((operation) => {
                operation.selected = true;
            });
        },
        clearAllOperations(state, action: PayloadAction<string>) {
            Object.values(state.operations[action.payload]).forEach((operation) => {
                operation.selected = false;
            });
        },
        selectQueue(state, action: PayloadAction<{ graphName: string; queueName: string; selected: boolean }>) {
            const { graphName, queueName, selected } = action.payload;
            const queue = state.queues[graphName][queueName];
            if (queue) {
                queue.selected = selected;
            }
        },
        selectAllQueues(state, action: PayloadAction<string>) {
            Object.values(state.queues[action.payload]).forEach((queue) => {
                queue.selected = true;
            });
        },
        clearAllQueues(state, action: PayloadAction<string>) {
            Object.values(state.queues[action.payload]).forEach((queue) => {
                queue.selected = false;
            });
        },
        updateFocusNode(state, action: PayloadAction<string | null>) {
            state.focusNode = action.payload;
        },
    },
});

export const {
    //
    loadNodesData,
    initialLoadQueues,
    initialLoadOPs,
    updateNodeSelection,
    selectOperation,
    selectAllOperations,
    clearAllOperations,
    selectQueue,
    selectAllQueues,
    clearAllQueues,
    clearAllNodes,
    updateFocusNode,
} = nodeSelectionSlice.actions;

export const nodeSelectionReducer = nodeSelectionSlice.reducer;
