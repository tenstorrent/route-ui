import { createSlice } from '@reduxjs/toolkit';
import { FeatureFlagsState } from 'data/StateTypes';

const featureFlagsInitialState: FeatureFlagsState = {
    showQueuesTable: false,
};

export const featureflagsSlice = createSlice({
    name: 'featureFlags',
    initialState: featureFlagsInitialState,
    reducers: {
        toggleQueuesTable: (state) => {
            state.showQueuesTable = !state.showQueuesTable;
        },
    },
});

export const { toggleQueuesTable } = featureflagsSlice.actions;

export const featureFlagsReducer = featureflagsSlice.reducer;
