import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { ApplicationMode, Architecture } from 'data/Types';
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
}

const uiStateInitialState: UIState = {
    dockOpen: false,
    highContrastEnabled: false,
    graphName: '',
    folderPath: '',
    architecture: Architecture.NONE,
    availableGraphs: [],
    applicationMode: ApplicationMode.NONE,
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
} = uiStateSlice.actions;
