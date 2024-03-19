import { RootState } from '../createStore';

export const getDockOpenState = (state: RootState) => state.uiState.dockOpen;
export const getHighContrastState = (state: RootState) => state.uiState.highContrastEnabled;
export const getFolderPathSelector = (state: RootState) => state.uiState.folderPath;
export const getSelectedRemoteFolder = (state: RootState) => state.uiState.selectedRemoteFolder;
export const getSelectedFolderLocationType = (state: RootState) => state.uiState.selectedFolderLocationType;
export const getApplicationMode = (state: RootState) => state.uiState.applicationMode;

export const getShowEmptyLinks = (state: RootState) => state.uiState.showEmptyLinks;

export const getShowOperationNames = (state: RootState) => state.uiState.showOperationNames;

export const getShowNodeLocation = (state: RootState) => state.uiState.showNodeLocation;

export const getGridZoom = (state: RootState) => state.uiState.gridZoom;

export const getDetailedViewZoom = (state: RootState) => state.uiState.detailedViewZoom;

export const getDetailedViewHeight = (state: RootState) => state.uiState.detailedViewHeight;
