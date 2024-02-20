import { RootState } from '../createStore';

export const getOperationPerformanceTreshold = (state: RootState) =>
    state.operationPerformance.operationPerformanceTreshold;

export const getShowOperationPerformanceGrid = (state: RootState) =>
    state.operationPerformance.showOperationPerformanceGrid;

export const getMaxBwLimitedFactor = (state: RootState) => state.operationPerformance.maxBwLimitedFactor;

export const getOperationRatioThreshold = (state: RootState) => state.operationPerformance.operationRatioThreshold;
