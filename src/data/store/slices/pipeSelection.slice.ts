import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PipeSelection, PipeSelectionState } from 'data/StateTypes';

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
            // state.pipes = {};
            // state.pipeIds = [];
            action.payload.forEach((item) => {
                state.pipes[item.id] = item;
                state.pipeIds.push(item.id);
            });
            state.pipeIds = [...new Set(state.pipeIds)];
        },
        bulkLoadPipeSelection(state, action: PayloadAction<PipeSelection[][]>) {
            action.payload.forEach((pipeSelection) => {
                pipeSelection.forEach((item) => {
                    state.pipes[item.id] = item;
                    state.pipeIds.push(item.id);
                });
            });

            state.pipeIds = [...new Set(state.pipeIds)];
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
        updateMultiplePipeSelection(state, action: PayloadAction<{ ids: string[]; selected: boolean }>) {
            const { ids, selected } = action.payload;
            ids.forEach((id) => {
                if (state.pipes[id]) {
                    state.pipes[id].selected = selected;
                }
            });
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
        resetPipeSelection(state) {
            state.pipes = {};
            state.pipeIds = [];
        },
    },
});
export const {
    //
    loadPipeSelection,
    bulkLoadPipeSelection,
    updatePipeSelection,
    clearAllPipes,
    selectAllPipes,
    updateFocusPipe,
    resetPipeSelection,
    updateMultiplePipeSelection,
} = pipeSelectionSlice.actions;

export const pipeSelectionReducer = pipeSelectionSlice.reducer;
