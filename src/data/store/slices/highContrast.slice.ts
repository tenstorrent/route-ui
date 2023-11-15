import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { HighContrastState } from 'data/StateTypes';

const highContrastInitialState: HighContrastState = {
    enabled: false,
};

export const highContrastSlice = createSlice({
    name: 'highContrast',
    initialState: highContrastInitialState,
    reducers: {
        setHighContrastState: (state, action: PayloadAction<boolean>) => {
            state.enabled = action.payload;
        },
    },
});
export const { setHighContrastState } = highContrastSlice.actions;

export const highContrastReducer = highContrastSlice.reducer;
