import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { ApplicationMode, Architecture } from 'data/Types';
import path from 'path';
import { GraphRelationshipState, type SelectedFolderOrigin } from '../../StateTypes';

interface UIState {
    dockOpen: boolean;
    highContrastEnabled: boolean;
    graphName: string;
    folderPath: string;
    selectedFolderOrigin: SelectedFolderOrigin;
    architecture: Architecture;
    availableGraphs: GraphRelationshipState[];
    applicationMode: ApplicationMode;
    showEmptyLinks: boolean;
    showOperationNames: boolean;
    // TODO: Rename to `snowNodeUID`
    showNodeLocation: boolean;
    gridZoom: number;
    detailedViewZoom: number;
}

const uiStateInitialState: UIState = {
    dockOpen: false,
    highContrastEnabled: false,
    graphName: '',
    folderPath: '',
    selectedFolderOrigin: 'local',
    architecture: Architecture.NONE,
    availableGraphs: [],
    applicationMode: ApplicationMode.NONE,
    showEmptyLinks: false,
    showOperationNames: false,
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
        setSelectedFolderOrigin(state, action: PayloadAction<SelectedFolderOrigin>) {
            state.selectedFolderOrigin = action.payload;
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
        updateShowEmptyLinks: (state, action: PayloadAction<boolean>) => {
            state.showEmptyLinks = action.payload;
        },
        updateShowOperationNames: (state, action: PayloadAction<boolean>) => {
            state.showOperationNames = action.payload;
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
    setSelectedFolderOrigin,
    setAvailableGraphs,
    clearAvailableGraphs,
    setApplicationMode,
    clearSelectedApplication,
    updateShowEmptyLinks,
    updateShowOperationNames,
    updateShowNodeLocation,
    updateGridZoom,
    updateDetailedViewZoom,
} = uiStateSlice.actions;
