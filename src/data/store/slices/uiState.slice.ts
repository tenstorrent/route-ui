import { PayloadAction, createSlice } from '@reduxjs/toolkit';

interface UIState {
    dockOpen: boolean;
}

const uiStateInitialState: UIState = {
    dockOpen: false,
};

const uiStateSlice = createSlice({
    name: 'uiState',
    initialState: uiStateInitialState,
    reducers: {
        setDockOpenState: (state, action: PayloadAction<boolean>) => {
            state.dockOpen = action.payload;
        },
    },
});

export const uiStateReducer = uiStateSlice.reducer;
export const { setDockOpenState } = uiStateSlice.actions;
