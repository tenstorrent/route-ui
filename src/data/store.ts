import {createSlice, configureStore, PayloadAction} from '@reduxjs/toolkit';

export interface PipeSelection {
    id: string;
    selected: boolean;
}

interface PipeSelectionState {
    pipes: Record<string, PipeSelection>;
    pipeIds: string[];
}

const pipesInitialState: PipeSelectionState = {
    pipes: {},
    pipeIds: [],
};

const pipeSelectionSlice = createSlice({
    name: 'pipeSelection',
    initialState: pipesInitialState,
    reducers: {
        loadPipeSelection(state, action: PayloadAction<PipeSelection[]>) {
            action.payload.forEach((item) => {
                state.pipes[item.id] = item;
                state.pipeIds.push(item.id);
            });
        },
        updatePipeSelection(state, action: PayloadAction<{id: string; selected: boolean}>) {
            const {id, selected} = action.payload;
            if (state.pipes[id]) {
                state.pipes[id].selected = selected;
            }
        },
        clearAllPipes(state) {
            state.pipeIds.forEach((id) => {
                state.pipes[id].selected = false;
            });
        },
    },
});
export const selectPipeSelectionById = (state: RootState, id: string) => state.pipeSelection.pipes[id];
export const {loadPipeSelection, updatePipeSelection, clearAllPipes} = pipeSelectionSlice.actions;

export interface NodeData extends NodeSelection {
    loc: {x: number; y: number};
    opName: string;
}

export interface NodeSelection {
    id: number;
    selected: boolean;
}

interface NodeSelectionState {
    groups: Record<string, NodeData[]>;
    nodeList: NodeData[];
}

const nodesInitialState: NodeSelectionState = {
    nodeList: [],
    groups: {},
};

const nodeSelectionSlice = createSlice({
    name: 'nodeSelection',
    initialState: nodesInitialState,
    reducers: {
        loadNodesData(state, action: PayloadAction<NodeData[]>) {
            state.groups = {};
            state.nodeList = [];
            action.payload.forEach((item) => {
                state.nodeList[item.id] = item;
                if (item.opName !== '') {
                    if (!state.groups[item.opName]) {
                        state.groups[item.opName] = [];
                    }
                    state.groups[item.opName].push(item);
                }
            });
        },
        updateNodeSelection(state, action: PayloadAction<{id: number; selected: boolean}>) {
            const {id, selected} = action.payload;
            const node: NodeData | undefined = state.nodeList[id];

            if (node) {
                node.selected = selected;

                if (!selected) {
                    const group = state.groups[node.opName];
                    if (group) {
                        group.forEach((groupNode) => {
                            groupNode.selected = false;
                            state.nodeList[groupNode.id].selected = selected;
                        });
                    }
                }
            }
        },
        selectGroup(state, action: PayloadAction<{opName: string; selected: boolean}>) {
            const {opName, selected} = action.payload;
            const group = state.groups[opName];
            if (group) {
                group.forEach((node) => {
                    node.selected = selected;
                    state.nodeList[node.id].selected = selected;
                });
            }
        },
    },
});
export const selectNodeSelectionById = (state: RootState, id: number) => state.nodeSelection.nodeList[id];
export const {loadNodesData, updateNodeSelection, selectGroup} = nodeSelectionSlice.actions;

const linkSaturationSlice = createSlice({
    name: 'linkSaturation',
    initialState: {
        linkSaturation: 75,
        showLinkSaturation: false,
    },
    reducers: {
        updateLinkSatuation: (state, action: PayloadAction<number>) => {
            state.linkSaturation = action.payload;
        },
        updateShowLinkSaturation: (state, action: PayloadAction<boolean>) => {
            state.showLinkSaturation = action.payload;
        },
    },
});
export const {updateLinkSatuation, updateShowLinkSaturation} = linkSaturationSlice.actions;
export const selectLinkSaturation = (state: RootState) => state.linkSaturation.linkSaturation;
export const selectShowLinkSaturation = (state: RootState) => state.linkSaturation.showLinkSaturation;

const store = configureStore({
    reducer: {
        pipeSelection: pipeSelectionSlice.reducer,
        nodeSelection: nodeSelectionSlice.reducer,
        linkSaturation: linkSaturationSlice.reducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export default store;
