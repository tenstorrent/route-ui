import { createSlice } from '@reduxjs/toolkit';
import { INITIAL_OPERATION_PERFORMANCE_THRESHOLD, MAX_OPERATION_PERFORMANCE_THRESHOLD } from '../../constants';

interface OperationPerformanceState {
    operationPerformanceTreshold: number;
    showOperationPerformanceGrid: boolean;
    maxBwLimitedFactor: number;
}

const operationPerformanceInitialState: OperationPerformanceState = {
    operationPerformanceTreshold: INITIAL_OPERATION_PERFORMANCE_THRESHOLD,
    showOperationPerformanceGrid: false,
    maxBwLimitedFactor: MAX_OPERATION_PERFORMANCE_THRESHOLD,
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
        updateMaxBwLimitedFactor: (state, action) => {
            state.maxBwLimitedFactor = action.payload;
        },
    },
});

export const {
    //
    updateOperationPerformanceThreshold,
    updateShowOperationPerformanceGrid,
    updateMaxBwLimitedFactor,
} = operationPerformanceSlice.actions;

export const operationPerformanceReducer = operationPerformanceSlice.reducer;