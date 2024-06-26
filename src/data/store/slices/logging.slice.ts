// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent AI ULC

import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { isDebug } from '../../../renderer/utils/env';
import { LogLevel } from '../../Types';

export interface LogEntry {
    logType: LogLevel;
    timestamp: number;
    message: string;
}

export interface LoggingState {
    entryList: Array<LogEntry>;
    outputsToConsole: boolean;
    logOutputEnabled: boolean;
}

const loggingInitialState: LoggingState = {
    entryList: [],
    outputsToConsole: isDebug(),
    logOutputEnabled: false,
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
        setLogOutputEnabled: (state, action: PayloadAction<boolean>) => {
            state.logOutputEnabled = action.payload;
        },
    },
});

export const { pushEntry, setOutputsToConsole, setLogOutputEnabled } = loggingSlice.actions;

export const loggingReducer = loggingSlice.reducer;
