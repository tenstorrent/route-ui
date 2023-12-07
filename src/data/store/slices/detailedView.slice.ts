import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DetailedViewState } from 'data/StateTypes';

const detailedViewInitialState: DetailedViewState = {
    isOpen: false,
    uid: null,
};

export const detailedViewSlice = createSlice({
    name: 'detailedView',
    initialState: detailedViewInitialState,
    reducers: {
        openDetailedView: (state, action: PayloadAction<string>) => {
            state.isOpen = true;
            state.uid = action.payload;
        },
        closeDetailedView: (state) => {
            state.isOpen = false;
            state.uid = null;
        },
    },
});

export const { openDetailedView, closeDetailedView } = detailedViewSlice.actions;

export const detailedViewReducer = detailedViewSlice.reducer;
