import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { LogLevel } from '../../Types';

export interface LogEntry {
    logType: LogLevel;
    timestamp: number;
    message: string;
}

export interface LoggingState {
    entryList: Array<LogEntry>;
    outputsToConsole: boolean;
    loggingPanelEnabled: boolean;
}

const loggingInitialState: LoggingState = {
    entryList: [],
    outputsToConsole: false,
    loggingPanelEnabled: false,
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
        setOutputsToConsole: (state, action: PayloadAction<boolean>) => {
            state.outputsToConsole = action.payload;
        },
        setLoggingPanelEnabledState: (state, action: PayloadAction<boolean>) => {
            state.loggingPanelEnabled = action.payload;
        },
    },
});

export const { pushEntry, setOutputsToConsole, setLoggingPanelEnabledState } = loggingSlice.actions;

export const loggingReducer = loggingSlice.reducer;
