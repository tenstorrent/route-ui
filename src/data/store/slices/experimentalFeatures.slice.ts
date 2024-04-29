// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent Inc.

import { createSlice } from '@reduxjs/toolkit';
import { ExperimentalFeaturesState } from 'data/StateTypes';

const experimentalFeaturesInitialState: ExperimentalFeaturesState = {};

export const experimentalFeaturesSlice = createSlice({
    name: 'experimentalFeatures',
    initialState: experimentalFeaturesInitialState,
    reducers: {},
});

export const experimentalFeaturesReducer = experimentalFeaturesSlice.reducer;
