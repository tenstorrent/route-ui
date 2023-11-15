import { RootState } from '../createStore';

export const getDockOpenState = (state: RootState) => state.uiState.dockOpen;

export default getDockOpenState;
