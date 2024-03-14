import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { ApplicationMode } from 'data/Types';
import path from 'path';
import type { RemoteFolder } from '../../../renderer/hooks/useRemote.hook';
import { type FolderLocationType } from '../../StateTypes';
import { INITIAL_DETAILS_VIEW_HEIGHT } from '../../constants';

interface UIState {
    dockOpen: boolean;
    highContrastEnabled: boolean;
    folderPath: string;
    selectedRemoteFolder?: RemoteFolder;
    selectedFolderLocationType: FolderLocationType;
    applicationMode: ApplicationMode;
    showEmptyLinks: boolean;
    showOperationNames: boolean;
    // TODO: Rename to `snowNodeUID`
    showNodeLocation: boolean;
    gridZoom: number;
    detailedViewZoom: number;
    detailedViewHeight: number;
}

const uiStateInitialState: UIState = {
    dockOpen: false,
    highContrastEnabled: false,
    folderPath: '',
    selectedRemoteFolder: undefined,
    selectedFolderLocationType: 'local',
    applicationMode: ApplicationMode.NONE,
    showEmptyLinks: false,
    showOperationNames: false,
    showNodeLocation: false,
    gridZoom: 1,
    detailedViewZoom: 1,
    detailedViewHeight: INITIAL_DETAILS_VIEW_HEIGHT,
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
        },
        setSelectedRemoteFolder(state, action: PayloadAction<RemoteFolder | undefined>) {
            state.selectedRemoteFolder = action.payload;
        },
        setSelectedFolderLocationType(state, action: PayloadAction<FolderLocationType>) {
            state.selectedFolderLocationType = action.payload;
        },
        setSelectedFolder(state, action: PayloadAction<string>) {
            state.folderPath = action.payload;
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
        updateDetailedViewHeight: (state, action: PayloadAction<number>) => {
            state.detailedViewHeight = action.payload;
        },
    },
});

export const uiStateReducer = uiStateSlice.reducer;
export const {
    setDockOpenState,
    setHighContrastState,
    setSelectedFile,
    setSelectedFolder,
    setSelectedRemoteFolder,
    setSelectedFolderLocationType,
    setApplicationMode,
    clearSelectedApplication,
    updateShowEmptyLinks,
    updateShowOperationNames,
    updateShowNodeLocation,
    updateGridZoom,
    updateDetailedViewZoom,
    updateDetailedViewHeight,
} = uiStateSlice.actions;
