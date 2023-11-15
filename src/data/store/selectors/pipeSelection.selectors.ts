import { RootState } from '../createStore';

export const selectPipeSelectionById = (state: RootState, id: string) => state.pipeSelection.pipes[id];
export const getFocusPipe = (state: RootState) => state.pipeSelection.focusPipe;
