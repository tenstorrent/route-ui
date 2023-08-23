import {createSlice, configureStore, PayloadAction} from '@reduxjs/toolkit';
import {updateOPCycles} from './DataStructures';

// TODO: reset methods for saturation
interface HighContrastState {
    enabled: boolean;
}

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
export const {setHighContrastState} = highContrastSlice.actions;
export const getHighContrastState = (state: RootState) => state.highContrast.enabled;

interface DetailedViewState {
    isOpen: boolean;
    uid: number | null;
}

const detailedViewInitialState: DetailedViewState = {
    isOpen: false,
    uid: null,
};

export const detailedViewSlice = createSlice({
    name: 'detailedView',
    initialState: detailedViewInitialState,
    reducers: {
        openDetailedView: (state, action: PayloadAction<number>) => {
            state.isOpen = true;
            state.uid = action.payload;
        },
        closeDetailedView: (state) => {
            state.isOpen = false;
            state.uid = null;
        },
    },
});

export const {openDetailedView, closeDetailedView} = detailedViewSlice.actions;

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
        selectAllPipes(state) {
            state.pipeIds.forEach((id) => {
                state.pipes[id].selected = true;
            });
        },
    },
});
export const selectPipeSelectionById = (state: RootState, id: string) => state.pipeSelection.pipes[id];
export const getDramGroup = (state: RootState, id: number) => (id > -1 ? state.nodeSelection.dram[id] : null);
export const {
    //
    loadPipeSelection,
    updatePipeSelection,
    clearAllPipes,
    selectAllPipes,
} = pipeSelectionSlice.actions;

export interface NodeData extends NodeSelection {
    loc: {x: number; y: number};
    opName: string;
    border: {left: boolean; right: boolean; top: boolean; bottom: boolean};
    dramChannel: number | -1;
    dramSubchannel: number | -1;
}

export interface NodeSelection {
    id: number;
    selected: boolean;
}

interface NodeSelectionState {
    groups: Record<string, {data: NodeData[]; selected: boolean}>;
    nodeList: NodeData[];
    filename: string;
    dram: {data: NodeData[]; selected: boolean}[];
    architecture: string;
}

const nodesInitialState: NodeSelectionState = {
    nodeList: [],
    groups: {},
    filename: '',
    dram: [],
    architecture: '',
};

const setBorders = (nodes: NodeData[]) => {
    const locations = new Set(nodes.map((node) => JSON.stringify(node.loc)));
    nodes.forEach((node) => {
        const leftLoc = {x: node.loc.x - 1, y: node.loc.y};
        const rightLoc = {x: node.loc.x + 1, y: node.loc.y};
        const topLoc = {x: node.loc.x, y: node.loc.y - 1};
        const bottomLoc = {x: node.loc.x, y: node.loc.y + 1};
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
        loadNodesData(state, action: PayloadAction<NodeData[]>) {
            state.groups = {};
            state.nodeList = [];
            state.dram = [];
            action.payload.forEach((item) => {
                state.nodeList[item.id] = item;
                if (item.opName !== '') {
                    if (!state.groups[item.opName]) {
                        state.groups[item.opName] = {data: [], selected: false};
                    }
                    state.groups[item.opName].data.push(item);
                }
                if (item.dramChannel !== -1) {
                    if (!state.dram[item.dramChannel]) {
                        state.dram[item.dramChannel] = {data: [], selected: false};
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
        updateNodeSelection(state, action: PayloadAction<{id: number; selected: boolean}>) {
            const {id, selected} = action.payload;
            const node: NodeData | undefined = state.nodeList[id];

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
        selectGroup(state, action: PayloadAction<{opName: string; selected: boolean}>) {
            const {opName, selected} = action.payload;
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

export const selectNodeSelectionById = (state: RootState, id: number) => state.nodeSelection.nodeList[id];
export const getGroup = (state: RootState, id: string) => state.nodeSelection.groups[id];
export const {
    //
    loadNodesData,
    updateNodeSelection,
    selectGroup,
    clearAllOperations,
    loadedFilename,
    setArchitecture,
} = nodeSelectionSlice.actions;

export interface LinkData {
    id: string;
    totalDataBytes: number;
    bpc: number;
    saturation: number;
    maxBandwidth: number;
}

interface LinkSaturationState {
    linkSaturation: number;
    showLinkSaturation: boolean;
    links: Record<string, LinkData>;
    totalOps: number;
}

const linkSaturationState: LinkSaturationState = {
    linkSaturation: 75, // TODO: MAGIC NUMBER!!!
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
        loadLinkData: (state, action: PayloadAction<LinkData[]>) => {
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
// export const selectLinkSaturation = (state: RootState) => state.linkSaturation.linkSaturation;
// export const selectShowLinkSaturation = (state: RootState) => state.linkSaturation.showLinkSaturation;

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
