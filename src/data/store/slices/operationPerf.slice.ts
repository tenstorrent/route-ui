// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent Inc.

import { createSlice } from '@reduxjs/toolkit';
import { INITIAL_OPERATION_PERFORMANCE_THRESHOLD, MAX_MODEL_RATIO_THRESHOLD } from '../../constants';

interface OperationPerformanceState {
    operationPerformanceTreshold: number;
    showOperationPerformanceGrid: boolean;
    operationRatioThreshold: number;
    maxBwLimitedFactor: number;
}

const operationPerformanceInitialState: OperationPerformanceState = {
    operationPerformanceTreshold: INITIAL_OPERATION_PERFORMANCE_THRESHOLD,
    showOperationPerformanceGrid: false,
    operationRatioThreshold: MAX_MODEL_RATIO_THRESHOLD,
    maxBwLimitedFactor: 1,
};

const operationPerformanceSlice = createSlice({
    name: 'operationsPerformance',
    initialState: operationPerformanceInitialState,
    reducers: {
        updateOperationPerformanceThreshold: (state, action) => {
            state.operationPerformanceTreshold = action.payload;
        },
        updateShowOperationPerformanceGrid: (state, action) => {
            state.showOperationPerformanceGrid = action.payload;
        },
        updateOperationRatioThreshold: (state, action) => {
            state.operationRatioThreshold = action.payload;
        },
        updateMaxBwLimitedFactor: (state, action) => {
            state.maxBwLimitedFactor = action.payload;
        },
    },
});

export const {
    updateOperationPerformanceThreshold,
    updateMaxBwLimitedFactor,
    updateShowOperationPerformanceGrid,
    updateOperationRatioThreshold,
} = operationPerformanceSlice.actions;

export const operationPerformanceReducer = operationPerformanceSlice.reducer;
