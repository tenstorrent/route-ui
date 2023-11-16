import { RootState } from '../createStore';

export const getDockOpenState = (state: RootState) => state.uiState.dockOpen;
export const getHighContrastState = (state: RootState) => state.uiState.highContrastEnabled;
export const getFileNameSelector = (state: RootState) => state.uiState.fileName;
export const getFilePathSelector = (state: RootState) => state.uiState.filePath;
export const getArchitectureSelector = (state: RootState) => state.uiState.architecture;
