import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { ApplicationMode, Architecture, NOC } from 'data/Types';
import path from 'path';
import { GraphRelationshipState } from '../../StateTypes';

interface UIState {
    dockOpen: boolean;
    highContrastEnabled: boolean;
    graphName: string;
    folderPath: string;
    architecture: Architecture;
    availableGraphs: GraphRelationshipState[];
    applicationMode: ApplicationMode;
    showLinkSaturation: boolean;
    showLinkSaturationNOC0: boolean;
    showLinkSaturationNOC1: boolean;
    showEmptyLinks: boolean;
    showOperationColors: boolean;
    showNodeLocation: boolean;
    gridZoom: number;
    detailedViewZoom: number;
}

const uiStateInitialState: UIState = {
    dockOpen: false,
    highContrastEnabled: false,
    graphName: '',
    folderPath: '',
    architecture: Architecture.NONE,
    availableGraphs: [],
    applicationMode: ApplicationMode.NONE,
    showLinkSaturation: false,
    showLinkSaturationNOC0: true,
    showLinkSaturationNOC1: true,
    showEmptyLinks: false,
    showOperationColors: false,
    showNodeLocation: false,
    gridZoom: 1,
    detailedViewZoom: 1,
};

const uiStateSlice = createSlice({
    name: 'uiState',
    initialState: uiStateInitialState,
    reducers: {
        setDockOpenState: (state, action: PayloadAction<boolean>) => {
            state.dockOpen = action.payload;
        },
        setHighContrastState: (state, action: PayloadAction<boolean>) => {
            state.highContrastEnabled = action.payload;
        },
        setSelectedFile(state, action: PayloadAction<string>) {
            state.folderPath = path.dirname(action.payload);
            state.graphName = path.basename(action.payload);
        },
        setSelectedGraphName(state, action: PayloadAction<string>) {
            state.graphName = action.payload;
        },
        setSelectedFolder(state, action: PayloadAction<string>) {
            state.folderPath = action.payload;
        },
        setSelectedArchitecture(state, action: PayloadAction<Architecture>) {
            state.architecture = action.payload;
        },
        setAvailableGraphs(state, action: PayloadAction<GraphRelationshipState[]>) {
            state.availableGraphs = action.payload;
        },
        clearAvailableGraphs(state) {
            state.availableGraphs = [];
        },
        setApplicationMode(state, action: PayloadAction<ApplicationMode>) {
            state.applicationMode = action.payload;
        },
        clearSelectedApplication(state) {
            state.applicationMode = ApplicationMode.NONE;
        },
        updateShowLinkSaturation: (state, action: PayloadAction<boolean>) => {
            state.showLinkSaturation = action.payload;
        },
        updateShowLinkSaturationForNOC: (state, action: PayloadAction<{ noc: NOC; selected: boolean }>) => {
            if (action.payload.noc === NOC.NOC0) {
                state.showLinkSaturationNOC0 = action.payload.selected;
            }
            if (action.payload.noc === NOC.NOC1) {
                state.showLinkSaturationNOC1 = action.payload.selected;
            }
        },
        updateShowEmptyLinks: (state, action: PayloadAction<boolean>) => {
            state.showEmptyLinks = action.payload;
        },
        updateShowOperationColors: (state, action: PayloadAction<boolean>) => {
            state.showOperationColors = action.payload;
        },
        updateShowNodeLocation: (state, action: PayloadAction<boolean>) => {
            state.showNodeLocation = action.payload;
        },
        updateGridZoom: (state, action: PayloadAction<number>) => {
            state.gridZoom = action.payload;
        },
        updateDetailedViewZoom: (state, action: PayloadAction<number>) => {
            state.detailedViewZoom = action.payload;
        },
    },
});

export const uiStateReducer = uiStateSlice.reducer;
export const {
    setDockOpenState,
    setHighContrastState,
    setSelectedFile,
    setSelectedGraphName,
    setSelectedArchitecture,
    setSelectedFolder,
    setAvailableGraphs,
    clearAvailableGraphs,
    setApplicationMode,
    clearSelectedApplication,
    updateShowLinkSaturation,
    updateShowLinkSaturationForNOC,
    updateShowEmptyLinks,
    updateShowOperationColors,
    updateShowNodeLocation,
    updateGridZoom,
    updateDetailedViewZoom,
} = uiStateSlice.actions;
