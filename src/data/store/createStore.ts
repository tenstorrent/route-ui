import { configureStore } from '@reduxjs/toolkit';
import { uiStateReducer } from './slices/uiState.slice';
import { highContrastReducer } from './slices/highContrast.slice';
import { detailedViewReducer } from './slices/detailedView.slice';
import { pipeSelectionReducer } from './slices/pipeSelection.slice';
import { nodeSelectionReducer } from './slices/nodeSelection.slice';
import { linkSaturationReducer } from './slices/linkSaturation.slice';

const store = configureStore({
    reducer: {
        uiState: uiStateReducer,
        pipeSelection: pipeSelectionReducer,
        nodeSelection: nodeSelectionReducer,
        linkSaturation: linkSaturationReducer,
        detailedView: detailedViewReducer,
        highContrast: highContrastReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export default store;
