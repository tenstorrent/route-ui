import { configureStore } from '@reduxjs/toolkit';
import { uiStateReducer } from './slices/uiState.slice';
import { detailedViewReducer } from './slices/detailedView.slice';
import { pipeSelectionReducer } from './slices/pipeSelection.slice';
import { nodeSelectionReducer } from './slices/nodeSelection.slice';
import { linkSaturationReducer } from './slices/linkSaturation.slice';
import { operationPerformanceReducer } from './slices/operationPerf.slice';
import { loggingReducer } from './slices/logging.slice';
import { clusterViewReducer } from './slices/clusterView.slice';

const store = configureStore({
    reducer: {
        uiState: uiStateReducer,
        pipeSelection: pipeSelectionReducer,
        nodeSelection: nodeSelectionReducer,
        linkSaturation: linkSaturationReducer,
        detailedView: detailedViewReducer,
        operationPerformance: operationPerformanceReducer,
        logging: loggingReducer,
        clusterView: clusterViewReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export default store;
