import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { recalculateLinkSaturation } from './Chip';

import {
    ComputeNodeState,
    DetailedViewState,
    HighContrastState,
    LinkState,
    NetworkCongestionState,
    NodeSelectionState,
    PipeSelection,
    PipeSelectionState,
} from './StateTypes';
import { LinkType, NOC } from './Types';
import {
    AICLK_INITIAL_MHZ,
    DRAM_BANDWIDTH_INITIAL_GBS,
    ETH_BANDWIDTH_INITIAL_GBS,
    LINK_SATURATION_INITIAIL_PERCENT,
    PCIE_BANDWIDTH_INITIAL_GBS,
} from './constants';

interface UIState {
    dockOpen: boolean;
}

const uiStateInitialState: UIState = {
    dockOpen: false,
};

const uiStateSlice = createSlice({
    name: 'uiState',
    initialState: uiStateInitialState,
    reducers: {
        setDockOpenState: (state, action: PayloadAction<boolean>) => {
            state.dockOpen = action.payload;
        },
    },
});
export const { setDockOpenState } = uiStateSlice.actions;
export const getDockOpenState = (state: RootState) => state.uiState.dockOpen;

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
    focusPipe: null,
};

const pipeSelectionSlice = createSlice({
    name: 'pipeSelection',
    initialState: pipesInitialState,
    reducers: {
        loadPipeSelection(state, action: PayloadAction<PipeSelection[]>) {
            state.pipes = {};
            state.pipeIds = [];
            action.payload.forEach((item) => {
                state.pipes[item.id] = item;
                state.pipeIds.push(item.id);
            });
        },
        updateFocusPipe(state, action: PayloadAction<string | null>) {
            state.focusPipe = action.payload;
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
export const getFocusPipe = (state: RootState) => state.pipeSelection.focusPipe;
export const getDramGroup = (state: RootState, id: number | undefined) =>
    id !== undefined && id > -1 ? state.nodeSelection.dram[id] : null;
export const {
    //
    loadPipeSelection,
    updatePipeSelection,
    clearAllPipes,
    selectAllPipes,
    updateFocusPipe,
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
            // state.coreHighlightList = {};
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
// export const getCoreHighlight = (state: RootState, id: string) =>
//     state.nodeSelection.coreHighlightList[id] || HighlightType.NONE;
export const getGroup = (state: RootState, id: string) => state.nodeSelection.groups[id];
export const {
    //
    loadNodesData,
    updateNodeSelection,
    selectGroup,
    clearAllOperations,
    loadedFilename,
    setArchitecture,
    selectOperand,
    loadIoDataIn,
    loadIoDataOut,
} = nodeSelectionSlice.actions;

const networkCongestionInitialState: NetworkCongestionState = {
    linkSaturation: LINK_SATURATION_INITIAIL_PERCENT,
    showLinkSaturation: false,
    showNOC0: true,
    showNOC1: true,
    links: {},
    totalOps: 0,
    CLKMHz: AICLK_INITIAL_MHZ,
    DRAMBandwidthGBs: DRAM_BANDWIDTH_INITIAL_GBS,
    PCIBandwidthGBs: PCIE_BANDWIDTH_INITIAL_GBS,
};

const linkSaturationSlice = createSlice({
    name: 'linkSaturation',
    initialState: networkCongestionInitialState,
    reducers: {
        updateLinkSaturation: (state, action: PayloadAction<number>) => {
            state.linkSaturation = action.payload;
        },
        updateShowLinkSaturation: (state, action: PayloadAction<boolean>) => {
            state.showLinkSaturation = action.payload;
        },
        updateShowLinkSaturationForNOC: (state, action: PayloadAction<{ noc: NOC; selected: boolean }>) => {
            if (action.payload.noc === NOC.NOC0) {
                state.showNOC0 = action.payload.selected;
            }
            if (action.payload.noc === NOC.NOC1) {
                state.showNOC1 = action.payload.selected;
            }
        },
        updateTotalOPs: (state, action: PayloadAction<number>) => {
            state.totalOps = action.payload;
            Object.values(state.links).forEach((linkState) => {
                recalculateLinkSaturation(linkState, action.payload);
            });
        },
        loadLinkData: (state, action: PayloadAction<LinkState[]>) => {
            state.links = {};
            action.payload.forEach((item) => {
                state.links[item.id] = item;
            });
            updateDRAMLinks(state);
            updateEthernetLinks(state);
        },
        updateCLK: (state, action: PayloadAction<number>) => {
            state.CLKMHz = action.payload;
            updateDRAMLinks(state);
            updatePCILinks(state);
        },
        updateDRAMBandwidth: (state, action: PayloadAction<number>) => {
            state.DRAMBandwidthGBs = action.payload;
            updateDRAMLinks(state);
        },
        updatePCIBandwidth: (state, action: PayloadAction<number>) => {
            state.PCIBandwidthGBs = action.payload;
            updatePCILinks(state);
        },
    },
});

const updateEthernetLinks = (state: NetworkCongestionState) => {
    Object.values(state.links).forEach((linkState: LinkState) => {
        if (linkState.type === LinkType.ETHERNET) {
            linkState.maxBandwidth = ETH_BANDWIDTH_INITIAL_GBS;
            recalculateLinkSaturation(linkState, state.totalOps);
        }
    });
};
const updateDRAMLinks = (state: NetworkCongestionState) => {
    const DRAMBandwidthBytes = state.DRAMBandwidthGBs * 1000 * 1000 * 1000; // there is a reason why this is not 1024
    const CLKHz = state.CLKMHz * 1000 * 1000;
    Object.values(state.links).forEach((linkState: LinkState) => {
        if (linkState.type === LinkType.DRAM) {
            linkState.maxBandwidth = DRAMBandwidthBytes / CLKHz;
            recalculateLinkSaturation(linkState, state.totalOps);
        }
    });
};
const updatePCILinks = (state: NetworkCongestionState) => {
    const PCIBandwidthGBs = state.PCIBandwidthGBs * 1000 * 1000 * 1000; // there is a reason why this is not 1024
    const CLKHz = state.CLKMHz * 1000 * 1000;
    Object.values(state.links).forEach((linkState: LinkState) => {
        if (linkState.type === LinkType.PCIE) {
            linkState.maxBandwidth = PCIBandwidthGBs / CLKHz;
            recalculateLinkSaturation(linkState, state.totalOps);
        }
    });
};
export const getLinkData = (state: RootState, id: string) => state.linkSaturation.links[id];
export const {
    //
    loadLinkData,
    updateTotalOPs,
    updateLinkSaturation,
    updateShowLinkSaturation,
    updateShowLinkSaturationForNOC,
    updateCLK,
    updateDRAMBandwidth,
    updatePCIBandwidth,
} = linkSaturationSlice.actions;

const store = configureStore({
    reducer: {
        uiState: uiStateSlice.reducer,
        pipeSelection: pipeSelectionSlice.reducer,
        nodeSelection: nodeSelectionSlice.reducer,
        linkSaturation: linkSaturationSlice.reducer,
        detailedView: detailedViewSlice.reducer,
        highContrast: highContrastSlice.reducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export default store;
