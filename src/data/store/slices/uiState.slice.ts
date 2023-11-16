import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { Architecture } from 'data/Types';
import path from 'path';

interface UIState {
    dockOpen: boolean;
    highContrastEnabled: boolean;
    fileName: string;
    filePath: string;
    architecture: Architecture;
}

const uiStateInitialState: UIState = {
    dockOpen: false,
    highContrastEnabled: false,
    fileName: '',
    filePath: '',
    architecture: Architecture.NONE,
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
            state.filePath = path.dirname(action.payload);
            state.fileName = path.basename(action.payload);
        },
        setSelectedFileName(state, action: PayloadAction<string>) {
            state.fileName = action.payload;
        },
        setSelectedFolder(state, action: PayloadAction<string>) {
            state.filePath = action.payload;
        },
        setSelectedArchitecture(state, action: PayloadAction<Architecture>) {
            state.architecture = action.payload;
        },
    },
});

export const uiStateReducer = uiStateSlice.reducer;
export const {
    setDockOpenState,
    setHighContrastState,
    setSelectedFile,
    setSelectedFileName,
    setSelectedArchitecture,
    setSelectedFolder,
} = uiStateSlice.actions;
