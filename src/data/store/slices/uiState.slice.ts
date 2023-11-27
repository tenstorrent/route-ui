import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { Architecture } from 'data/Types';
import path from 'path';

interface UIState {
    dockOpen: boolean;
    highContrastEnabled: boolean;
    graphName: string;
    folderPath: string;
    architecture: Architecture;
    availableGraphs: string[];
}

const uiStateInitialState: UIState = {
    dockOpen: false,
    highContrastEnabled: false,
    graphName: '',
    folderPath: '',
    architecture: Architecture.NONE,
    availableGraphs: [],
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
        setAvailableGraphs(state, action: PayloadAction<string[]>) {
            state.availableGraphs = action.payload;
        },
        clearAvailableGraphs(state) {
            state.availableGraphs = [];
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
} = uiStateSlice.actions;
