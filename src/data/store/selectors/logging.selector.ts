import { LogLevel } from '../../Types';
import { RootState } from '../createStore';

export const getLogEntry = (state: RootState, id: number) => state.logging.entryList[id];

export const getLogEntries = (state: RootState) => state.logging.entryList;

export const getLogEntriesByType = (state: RootState, type: LogLevel) =>
    state.logging.entryList.filter((e) => e.logType === type);

export const getOutputsToConsole = (state: RootState) => state.logging.outputsToConsole;

export const getLogOutputEnabled = (state: RootState) => state.logging.logOutputEnabled;
