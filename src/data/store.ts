import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { updateOPCycles } from './Chip';
import { LINK_SATURATION_INITIAIL_VALUE } from './constants';
import {
    ComputeNodeState,
    DetailedViewState,
    HighContrastState,
    HighlightType,
    LinkSaturationState,
    LinkStateData,
    NodeSelectionState,
    PipeSelection,
    PipeSelectionState,
} from './StateTypes';

const highContrastInitialState: HighContrastState = {
    enabled: false,
};

export const highContrastSlice = createSlice({
    name: 'highContrast',
    initialState: highContrastInitialState,
    reducers: {
        setHighContrastState: (state, action: PayloadAction<boolean>) => {
            state.enabled = action.payload;
        },
    },
});
export const { setHighContrastState } = highContrastSlice.actions;
export const getHighContrastState = (state: RootState) => state.highContrast.enabled;

const detailedViewInitialState: DetailedViewState = {
    isOpen: false,
    uid: null,
};

export const detailedViewSlice = createSlice({
    name: 'detailedView',
    initialState: detailedViewInitialState,
    reducers: {
        openDetailedView: (state, action: PayloadAction<string>) => {
            state.isOpen = true;
            state.uid = action.payload;
        },
        closeDetailedView: (state) => {
            state.isOpen = false;
            state.uid = null;
        },
    },
});

export const { openDetailedView, closeDetailedView } = detailedViewSlice.actions;

const pipesInitialState: PipeSelectionState = {
    pipes: {},
    pipeIds: [],
    focusPipes: {},
    focusMode: false,
};

const pipeSelectionSlice = createSlice({
    name: 'pipeSelection',
    initialState: pipesInitialState,
    reducers: {
        loadPipeSelection(state, action: PayloadAction<PipeSelection[]>) {
            state.pipes = {};
            state.pipeIds = [];
            state.focusPipes = {};
            action.payload.forEach((item) => {
                state.pipes[item.id] = item;
                state.pipeIds.push(item.id);
                state.focusPipes[item.id] = item;
            });
        },
        updateFocusPipeSelection(state, action: PayloadAction<{ id: string; selected: boolean }>) {
            const { id, selected } = action.payload;
            if (state.focusPipes[id]) {
                state.focusPipes[id].selected = selected;
                state.focusMode = selected;
            }
        },
        updatePipeSelection(state, action: PayloadAction<{ id: string; selected: boolean }>) {
            const { id, selected } = action.payload;
            if (state.pipes[id]) {
                state.pipes[id].selected = selected;
            }
        },
        clearAllPipes(state) {
            state.pipeIds.forEach((id) => {
                state.pipes[id].selected = false;
            });
        },
        selectAllPipes(state) {
            state.pipeIds.forEach((id) => {
                state.pipes[id].selected = true;
            });
        },
    },
});
export const selectPipeSelectionById = (state: RootState, id: string) => state.pipeSelection.pipes[id];
export const getFocusModePipe = (state: RootState, id: string) => state.pipeSelection.focusPipes[id];
export const getFocusModeState = (state: RootState) => state.pipeSelection.focusMode;
export const getDramGroup = (state: RootState, id: number) => (id > -1 ? state.nodeSelection.dram[id] : null);
export const {
    //
    loadPipeSelection,
    updatePipeSelection,
    clearAllPipes,
    selectAllPipes,
    updateFocusPipeSelection,
} = pipeSelectionSlice.actions;

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
                if (item.dramChannel !== -1) {
                    if (!state.dram[item.dramChannel]) {
                        state.dram[item.dramChannel] = { data: [], selected: false };
                    }
                    state.dram[item.dramChannel].data.push(item);
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

export enum IoType {
    ALL = 'all',
    IN = 'in',
    OUT = 'out',
}

export const selectNodeSelectionById = (state: RootState, id: string) => state.nodeSelection.nodeList[id];
export const getCoreHighlight = (state: RootState, id: string) =>
    state.nodeSelection.coreHighlightList[id] || HighlightType.NONE;
export const getGroup = (state: RootState, id: string) => state.nodeSelection.groups[id];
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

const linkSaturationState: LinkSaturationState = {
    linkSaturation: LINK_SATURATION_INITIAIL_VALUE,
    showLinkSaturation: false,
    links: {},
    totalOps: 0,
};

const linkSaturationSlice = createSlice({
    name: 'linkSaturation',
    initialState: linkSaturationState,
    reducers: {
        updateLinkSatuation: (state, action: PayloadAction<number>) => {
            state.linkSaturation = action.payload;
        },
        updateShowLinkSaturation: (state, action: PayloadAction<boolean>) => {
            state.showLinkSaturation = action.payload;
        },
        updateTotalOPs: (state, action: PayloadAction<number>) => {
            state.totalOps = action.payload;
            Object.values(state.links).forEach((link) => {
                updateOPCycles(link, action.payload);
            });
        },
        loadLinkData: (state, action: PayloadAction<LinkStateData[]>) => {
            state.links = {};
            action.payload.forEach((item) => {
                state.links[item.id] = item;
            });
        },
    },
});
export const getLinkData = (state: RootState, id: string) => state.linkSaturation.links[id];
export const {
    //
    loadLinkData,
    updateTotalOPs,
    updateLinkSatuation,
    updateShowLinkSaturation,
} = linkSaturationSlice.actions;

const store = configureStore({
    reducer: {
        pipeSelection: pipeSelectionSlice.reducer,
        nodeSelection: nodeSelectionSlice.reducer,
        linkSaturation: linkSaturationSlice.reducer,
        detailedView: detailedViewSlice.reducer,
        highContrast: highContrastSlice.reducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export default store;
