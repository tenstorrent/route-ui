import { RootState } from '../createStore';

export const getDockOpenState = (state: RootState) => state.uiState.dockOpen;
export const getHighContrastState = (state: RootState) => state.uiState.highContrastEnabled;
export const getGraphNameSelector = (state: RootState) => state.uiState.graphName;
export const getFolderPathSelector = (state: RootState) => state.uiState.folderPath;
export const getArchitectureSelector = (state: RootState) => state.uiState.architecture;
export const getAvailableGraphsSelector = (state: RootState) => state.uiState.availableGraphs;
export const getApplicationMode = (state: RootState) => state.uiState.applicationMode;

export const getShowLinkSaturation = (state: RootState) => state.uiState.showLinkSaturation;

export const getShowLinkSaturationNOC0 = (state: RootState) => state.uiState.showLinkSaturationNOC0;

export const getShowLinkSaturationNOC1 = (state: RootState) => state.uiState.showLinkSaturationNOC1;

export const getShowEmptyLinks = (state: RootState) => state.uiState.showEmptyLinks;

export const getShowOperationColors = (state: RootState) => state.uiState.showOperationColors;

export const getShowNodeLocation = (state: RootState) => state.uiState.showNodeLocation;

export const getGridZoom = (state: RootState) => state.uiState.gridZoom;

export const getDetailedViewZoom = (state: RootState) => state.uiState.detailedViewZoom;
