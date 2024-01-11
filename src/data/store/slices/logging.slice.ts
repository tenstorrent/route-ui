import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { LogType } from '../../Types';

export interface LogEntry<T extends LogType = LogType> {
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
        pushEntry: (state, action: PayloadAction<{ type?: LogType; message: string }>) => {
            state.entryList.push({
                logType: action.payload.type ?? LogType.LOG,
                timestamp: Date.now(),
                message: action.payload.message,
            });
        },
    },
});

export const { pushEntry } = loggingSlice.actions;

export const loggingReducer = loggingSlice.reducer;
