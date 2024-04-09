// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent Inc.

import { type PayloadAction, createSlice } from '@reduxjs/toolkit';
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
    },
});

export const { toggleQueuesTable } = experimentalFeaturesSlice.actions;

export const experimentalFeaturesReducer = experimentalFeaturesSlice.reducer;
