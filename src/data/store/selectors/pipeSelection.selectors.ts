import { RootState } from '../createStore';

export const selectPipeSelectionById = (state: RootState, id: string) => state.pipeSelection.pipes[id];

export const getSelectedPipes = (state: RootState, ids: string[]) => {
    return ids.map((id) => state.pipeSelection.pipes[id]);
};
export const getFocusPipe = (state: RootState) => state.pipeSelection.focusPipe;
