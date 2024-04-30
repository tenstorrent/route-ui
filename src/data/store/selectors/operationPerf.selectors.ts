// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent Inc.

import { RootState } from '../createStore';

export const getOperationPerformanceTreshold = (state: RootState) =>
    state.operationPerformance.operationPerformanceTreshold;

export const getShowOperationPerformanceGrid = (state: RootState) =>
    state.operationPerformance.showOperationPerformanceGrid;

export const getOperationRatioThreshold = (state: RootState) => state.operationPerformance.operationRatioThreshold;
