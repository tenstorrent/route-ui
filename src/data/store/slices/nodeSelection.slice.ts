import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ComputeNodeState, ComputeNodeLocation, NodeSelectionState } from 'data/StateTypes';

const nodesInitialState: NodeSelectionState = {
    nodeList: {},
    operations: {},
    queues: {},
    dram: [],
};

interface NeighborNodes {
    top?: ComputeNodeLocation;
    bottom?: ComputeNodeLocation;
    left?: ComputeNodeLocation;
    right?: ComputeNodeLocation;
}

function findSiblingNodeLocations(node: ComputeNodeState, nodes: ComputeNodeState[]): NeighborNodes {
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
}

const setSiblings = (nodes: ComputeNodeState[]) => {
    nodes.forEach((node) => {
        node.siblings = findSiblingNodeLocations(node, nodes);
    });
};

const nodeSelectionSlice = createSlice({
    name: 'nodeSelection',
    initialState: nodesInitialState,
    reducers: {
        loadNodesData(state, action: PayloadAction<ComputeNodeState[]>) {
            state.operations = {};
            state.nodeList = {};
            state.dram = [];
            state.queues = {};

            action.payload.forEach((item) => {
                state.nodeList[item.id] = item;
                if (item.opName !== '') {
                    if (!state.operations[item.opName]) {
                        state.operations[item.opName] = { data: [], selected: false };
                    }
                    state.operations[item.opName].data.push(item);
                }
                if (item.dramChannelId !== -1) {
                    if (!state.dram[item.dramChannelId]) {
                        state.dram[item.dramChannelId] = { data: [], selected: false };
                    }
                    state.dram[item.dramChannelId].data.push(item);
                }
                if (item.queueNameList.length > 0) {
                    item.queueNameList.forEach((queueName) => {
                        if (!state.queues[queueName]) {
                            state.queues[queueName] = { data: [], selected: false };
                        }
                        state.queues[queueName].data.push(item);
                    });
                }
            });

            Object.values(state.operations).forEach((operation) => {
                setSiblings(operation.data);
            });

            Object.values(state.queues).forEach((queue) => {
                setSiblings(queue.data);
            });

            state.dram.forEach((dramElement) => {
                setSiblings(dramElement.data);
            });
        },

        updateNodeSelection(state, action: PayloadAction<{ id: string; selected: boolean }>) {
            const { id, selected } = action.payload;
            const node: ComputeNodeState | undefined = state.nodeList[id];

            if (node) {
                node.selected = selected;
            }
            state.dram.forEach((dramGroup) => {
                if (dramGroup.data.map((n) => n.id).filter((nodeid) => state.nodeList[nodeid].selected).length > 0) {
                    dramGroup.selected = true;
                } else {
                    dramGroup.selected = false;
                }
            });
        },

        selectOperation(state, action: PayloadAction<{ opName: string; selected: boolean }>) {
            const { opName, selected } = action.payload;
            const operation = state.operations[opName];
            if (operation) {
                operation.selected = selected;
            }
        },
        clearAllOperations(state) {
            Object.values(state.operations).forEach((operation) => {
                operation.selected = false;
            });
        },
        selectQueue(state, action: PayloadAction<{ queueName: string; selected: boolean }>) {
            const { queueName, selected } = action.payload;
            const queue = state.queues[queueName];
            if (queue) {
                queue.selected = selected;
            }
        },
        clearAllQueues(state) {
            Object.values(state.queues).forEach((queue) => {
                queue.selected = false;
            });
        },
    },
});

export const {
    //
    loadNodesData,
    updateNodeSelection,
    selectOperation,
    clearAllOperations,
    selectQueue,
    clearAllQueues,
} = nodeSelectionSlice.actions;

export const nodeSelectionReducer = nodeSelectionSlice.reducer;
