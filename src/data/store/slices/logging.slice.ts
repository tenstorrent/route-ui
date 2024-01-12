import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { LogLevel } from '../../Types';

export interface LogEntry<T extends LogLevel = LogLevel> {
    logType: T;
    timestamp: number;
    message: string;
}

export interface LoggingState {
    entryList: Array<LogEntry>;
}

const loggingInitialState: LoggingState = {
    entryList: [],
};

export const loggingSlice = createSlice({
    name: 'logging',
    initialState: loggingInitialState,
    reducers: {
        pushEntry: (state, action: PayloadAction<{ message: string; type?: LogLevel }>) => {
            state.entryList.push({
                logType: action.payload.type ?? LogLevel.LOG,
                timestamp: Date.now(),
                message: action.payload.message,
            });
        },
    },
});

export const { pushEntry } = loggingSlice.actions;

export const loggingReducer = loggingSlice.reducer;
