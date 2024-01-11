import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { LogType } from '../../Types';

export interface Log<T extends LogType = LogType> {
    logType: T;
    timestamp: number;
    message: string;
}

export interface LoggingState {
    logs: Array<Log>;
}

const loggingInitialState: LoggingState = {
    logs: [],
};

export const loggingSlice = createSlice({
    name: 'logging',
    initialState: loggingInitialState,
    reducers: {
        logMessage: (state, action: PayloadAction<{ type: LogType; message: string }>) => {
            state.logs.push({
                logType: action.payload.type,
                timestamp: Date.now(),
                message: action.payload.message,
            });
        },
    },
});

export const { logMessage } = loggingSlice.actions;

export const loggingReducer = loggingSlice.reducer;
