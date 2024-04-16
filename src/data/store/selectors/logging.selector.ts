// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent Inc.

import { LogLevel } from '../../Types';
import { RootState } from '../createStore';

export const getLogEntries = (state: RootState) => state.logging.entryList;

export const getLogEntriesByType = (type: LogLevel) => (state: RootState) =>
    state.logging.entryList.filter((e) => e.logType === type);

export const getOutputsToConsole = (state: RootState) => state.logging.outputsToConsole;

export const getLogOutputEnabled = (state: RootState) => state.logging.logOutputEnabled;
