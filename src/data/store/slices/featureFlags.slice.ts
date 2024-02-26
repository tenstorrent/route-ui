import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { FeatureFlagsState } from 'data/StateTypes';

const featureFlagsInitialState: FeatureFlagsState = {
    showQueuesTable: false,
};

export const featureflagsSlice = createSlice({
    name: 'featureFlags',
    initialState: featureFlagsInitialState,
    reducers: {
        toggleQueuesTable: (state, action: PayloadAction<boolean | undefined>) => {
            state.showQueuesTable = action.payload ?? !state.showQueuesTable;
        },
    },
});

export const { toggleQueuesTable } = featureflagsSlice.actions;

export const featureFlagsReducer = featureflagsSlice.reducer;
