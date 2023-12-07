import { RootState } from '../createStore';

export const getDockOpenState = (state: RootState) => state.uiState.dockOpen;
export const getHighContrastState = (state: RootState) => state.uiState.highContrastEnabled;
export const getGraphNameSelector = (state: RootState) => state.uiState.graphName;
export const getFolderPathSelector = (state: RootState) => state.uiState.folderPath;
export const getArchitectureSelector = (state: RootState) => state.uiState.architecture;
export const getAvailableGraphsSelector = (state: RootState) => state.uiState.availableGraphs;
export const getApplicationMode = (state: RootState) => state.uiState.applicationMode;
