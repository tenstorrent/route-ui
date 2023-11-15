import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PipeSelectionState, PipeSelection } from 'data/StateTypes';

const pipesInitialState: PipeSelectionState = {
    pipes: {},
    pipeIds: [],
    focusPipe: null,
};

const pipeSelectionSlice = createSlice({
    name: 'pipeSelection',
    initialState: pipesInitialState,
    reducers: {
        loadPipeSelection(state, action: PayloadAction<PipeSelection[]>) {
            state.pipes = {};
            state.pipeIds = [];
            action.payload.forEach((item) => {
                state.pipes[item.id] = item;
                state.pipeIds.push(item.id);
            });
        },
        updateFocusPipe(state, action: PayloadAction<string | null>) {
            state.focusPipe = action.payload;
        },
        updatePipeSelection(state, action: PayloadAction<{ id: string; selected: boolean }>) {
            const { id, selected } = action.payload;
            if (state.pipes[id]) {
                state.pipes[id].selected = selected;
            }
        },
        clearAllPipes(state) {
            state.pipeIds.forEach((id) => {
                state.pipes[id].selected = false;
            });
        },
        selectAllPipes(state) {
            state.pipeIds.forEach((id) => {
                state.pipes[id].selected = true;
            });
        },
    },
});
export const {
    //
    loadPipeSelection,
    updatePipeSelection,
    clearAllPipes,
    selectAllPipes,
    updateFocusPipe,
} = pipeSelectionSlice.actions;

export const pipeSelectionReducer = pipeSelectionSlice.reducer;
