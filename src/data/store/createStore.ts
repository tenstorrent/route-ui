/**
 * SPDX-License-Identifier: Apache-2.0
 * SPDX-FileCopyrightText: © 2024 Tenstorrent Inc.
 */

import { configureStore } from '@reduxjs/toolkit';
import { clusterViewReducer } from './slices/clusterView.slice';
import { experimentalFeaturesReducer } from './slices/experimentalFeatures.slice';
import { linkSaturationReducer } from './slices/linkSaturation.slice';
import { loggingReducer } from './slices/logging.slice';
import { nodeSelectionReducer } from './slices/nodeSelection.slice';
import { operationPerformanceReducer } from './slices/operationPerf.slice';
import { pipeSelectionReducer } from './slices/pipeSelection.slice';
import { uiStateReducer } from './slices/uiState.slice';

const store = configureStore({
    reducer: {
        uiState: uiStateReducer,
        pipeSelection: pipeSelectionReducer,
        nodeSelection: nodeSelectionReducer,
        linkSaturation: linkSaturationReducer,
        operationPerformance: operationPerformanceReducer,
        logging: loggingReducer,
        clusterView: clusterViewReducer,
        experimentalFeatures: experimentalFeaturesReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export default store;
