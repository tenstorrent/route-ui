import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { ComputeNodeState, HighlightType, IoType, NodeSelectionState } from 'data/StateTypes';

const nodesInitialState: NodeSelectionState = {
    nodeList: {},
    coreHighlightList: {},
    groups: {},
    ioGroupsIn: {},
    operandsIn: {},
    ioGroupsOut: {},
    operandsOut: {},
    filename: '',
    dram: [],
    architecture: '',
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
        loadedFilename(state, action: PayloadAction<string>) {
            state.filename = action.payload;
        },
        setArchitecture(state, action: PayloadAction<string>) {
            state.architecture = action.payload;
        },
        loadNodesData(state, action: PayloadAction<ComputeNodeState[]>) {
            state.groups = {};
            state.coreHighlightList = {};
            state.ioGroupsIn = {};
            state.operandsIn = {};
            state.ioGroupsOut = {};
            state.operandsOut = {};
            state.nodeList = {};
            state.dram = [];
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
            });

            // this only runs one time per file load
            Object.values(state.groups).forEach((group) => {
                setBorders(group.data);
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
        updateCoreHighlight(state, action: PayloadAction<{ ids: string[]; selected: HighlightType }>) {
            action.payload.ids.forEach((id) => {
                state.coreHighlightList[id] = action.payload.selected;
            });
        },
        resetCoreHighlight(state) {
            state.coreHighlightList = {};
        },
        loadIoDataIn(state, action: PayloadAction<Map<string, string[]>>) {
            action.payload.forEach((ops, uid) => {
                state.ioGroupsIn[uid] = ops.map((op) => {
                    state.operandsIn[op] = false;
                    return { op, selected: false };
                });
            });
        },
        loadIoDataOut(state, action: PayloadAction<Map<string, string[]>>) {
            action.payload.forEach((ops, uid) => {
                state.ioGroupsOut[uid] = ops.map((op) => {
                    state.operandsOut[op] = false;
                    return { op, selected: false };
                });
            });
        },
        selectOperand(state, action: PayloadAction<{ op: string; selected: boolean; type?: IoType }>) {
            const { op, selected } = action.payload;
            const type = action.payload.type || IoType.ALL;
            switch (type) {
                case IoType.ALL:
                    Object.values(state.ioGroupsIn).forEach((data) => {
                        data.forEach((operand) => {
                            if (operand.op === op) {
                                operand.selected = selected;
                            }
                        });
                    });
                    Object.values(state.ioGroupsOut).forEach((data) => {
                        data.forEach((operand) => {
                            if (operand.op === op) {
                                operand.selected = selected;
                            }
                        });
                    });
                    break;
                case IoType.IN:
                    state.operandsIn[op] = selected;
                    Object.values(state.ioGroupsIn).forEach((data) => {
                        data.forEach((operand) => {
                            if (operand.op === op) {
                                operand.selected = selected;
                            }
                        });
                    });
                    break;
                case IoType.OUT:
                    state.operandsOut[op] = selected;
                    Object.values(state.ioGroupsOut).forEach((data) => {
                        data.forEach((operand) => {
                            if (operand.op === op) {
                                operand.selected = selected;
                            }
                        });
                    });
                    break;
                default:
                    break;
            }
        },
        selectGroup(state, action: PayloadAction<{ opName: string; selected: boolean }>) {
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
    },
});

export const {
    //
    loadNodesData,
    updateCoreHighlight,
    updateNodeSelection,
    selectGroup,
    clearAllOperations,
    loadedFilename,
    setArchitecture,
    selectOperand,
    loadIoDataIn,
    loadIoDataOut,
    resetCoreHighlight,
} = nodeSelectionSlice.actions;

export const nodeSelectionReducer = nodeSelectionSlice.reducer;
