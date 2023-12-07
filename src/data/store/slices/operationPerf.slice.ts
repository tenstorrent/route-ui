import { createSlice } from '@reduxjs/toolkit';
import { INITIAL_OPERATION_PERFORMANCE_THRESHOLD } from '../../constants';

interface OperationPerformanceState {
    operationPerformanceTreshold: number;
    showOperationPerformanceGrid: boolean;
}

const operationPerformanceInitialState: OperationPerformanceState = {
    operationPerformanceTreshold: INITIAL_OPERATION_PERFORMANCE_THRESHOLD,
    showOperationPerformanceGrid: false,
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
    },
});

export const {
    //
    updateOperationPerformanceThreshold,
    updateShowOperationPerformanceGrid,
} = operationPerformanceSlice.actions;

export const operationPerformanceReducer = operationPerformanceSlice.reducer;
