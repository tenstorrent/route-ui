import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { ExperimentalFeaturesState } from 'data/StateTypes';

const experimentalFeaturesInitialState: ExperimentalFeaturesState = {
    showQueuesTable: false,
    showClusterView: false,
};

export const experimentalFeaturesSlice = createSlice({
    name: 'experimentalFeatures',
    initialState: experimentalFeaturesInitialState,
    reducers: {
        toggleQueuesTable: (state, action: PayloadAction<boolean | undefined>) => {
            state.showQueuesTable = action.payload ?? !state.showQueuesTable;
        },
        toggleClusterView: (state, action: PayloadAction<boolean | undefined>) => {
            state.showClusterView = action.payload ?? !state.showClusterView;
        }
    },
});

export const { toggleQueuesTable, toggleClusterView } = experimentalFeaturesSlice.actions;

export const experimentalFeaturesReducer = experimentalFeaturesSlice.reducer;
