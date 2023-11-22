import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ComputeNodeState, NodeSelectionState } from 'data/StateTypes';

const nodesInitialState: NodeSelectionState = {
    nodeList: {},
    groups: {},
    queues: {},
    dram: [],
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
        // this only runs one time per file load
        loadNodesData(state, action: PayloadAction<ComputeNodeState[]>) {
            state.groups = {};
            state.nodeList = {};
            state.dram = [];
            state.queues = {};
            action.payload.forEach((item) => {
                state.nodeList[item.id] = item;
                if (item.opName !== '') {
                    if (!state.groups[item.opName]) {
                        state.groups[item.opName] = { data: [], selected: false };
                    }
                    state.groups[item.opName].data.push(item);
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
            Object.values(state.groups).forEach((group) => {
                setBorders(group.data);
            });
            Object.values(state.queues).forEach((queue) => {
                setBorders(queue.data);
            });
            state.dram.forEach((dramElement) => {
                setBorders(dramElement.data);
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

        /** select operation */
        selectGroup(state, action: PayloadAction<{ opName: string; selected: boolean }>) {
            // TODO: refactor
            const { opName, selected } = action.payload;
            const group = state.groups[opName];
            if (group) {
                group.selected = selected;
            }
        },
        clearAllOperations(state) {
            Object.values(state.groups).forEach((group) => {
                group.selected = false;
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
        }
    },
});

export const {
    //
    loadNodesData,
    updateNodeSelection,
    selectGroup,
    clearAllOperations,
    selectQueue,
    clearAllQueues,
} = nodeSelectionSlice.actions;

export const nodeSelectionReducer = nodeSelectionSlice.reducer;
