// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent Inc.

import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { ApplicationMode } from 'data/Types';
import path from 'path';
import type { RemoteFolder } from '../../../renderer/hooks/useRemote.hook';
import { type FolderLocationType } from '../../StateTypes';
import { INITIAL_DETAILS_VIEW_HEIGHT } from '../../constants';

interface UIState {
    dockOpen: boolean;
    detailsViewOpen: boolean;
    selectedDetailsViewUID: string | null;
    highContrastEnabled: boolean;
    folderPath: string;
    selectedRemoteFolder?: RemoteFolder;
    selectedFolderLocationType: FolderLocationType;
    isLoadingFolder: boolean;
    applicationMode: ApplicationMode;
    showEmptyLinks: boolean;
    showOperationNames: boolean;
    showNodeUID: boolean;
    gridZoom: number;
    detailedViewZoom: number;
    detailedViewHeight: number;
}

const uiStateInitialState: UIState = {
    dockOpen: false,
    detailsViewOpen: false,
    selectedDetailsViewUID: null,
    highContrastEnabled: false,
    folderPath: '',
    selectedRemoteFolder: undefined,
    selectedFolderLocationType: 'local',
    isLoadingFolder: false,
    applicationMode: ApplicationMode.NONE,
    showEmptyLinks: false,
    showOperationNames: false,
    showNodeUID: false,
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
        setIsLoadingFolder(state, action: PayloadAction<boolean>) {
            state.isLoadingFolder = action.payload;
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
        updateShowNodeUID: (state, action: PayloadAction<boolean>) => {
            state.showNodeUID = action.payload;
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
        openDetailedView: (state, action: PayloadAction<string>) => {
            state.detailsViewOpen = true;
            state.dockOpen = false;
            state.selectedDetailsViewUID = action.payload;
        },
        closeDetailedView: (state) => {
            state.detailsViewOpen = false;
            state.selectedDetailsViewUID = null;
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
    setIsLoadingFolder,
    setApplicationMode,
    clearSelectedApplication,
    updateShowEmptyLinks,
    updateShowOperationNames,
    updateShowNodeUID,
    updateGridZoom,
    updateDetailedViewZoom,
    updateDetailedViewHeight,
    openDetailedView,
    closeDetailedView,
} = uiStateSlice.actions;
