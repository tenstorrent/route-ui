/* eslint-disable no-console */

import { useDispatch, useSelector } from 'react-redux';
import { pushEntry, LogEntry } from '../../data/store/slices/logging.slice';

import { RootState } from '../../data/store/createStore';
import { LogType } from '../../data/Types';

interface LoggingHook {
    logMessage: (message: string) => void;
    logInfo: (message: string) => void;
    logError: (message: string) => void;
    logWarning: (message: string) => void;

    listAllLogs: () => Array<LogEntry>;
    listMessageLogs: () => Array<LogEntry<LogType.LOG>>;
    listInfoLogs: () => Array<LogEntry<LogType.INFO>>;
    listErrorLogs: () => Array<LogEntry<LogType.ERROR>>;
    listWarningLogs: () => Array<LogEntry<LogType.WARNING>>;
}

const useLogging = (): LoggingHook => {
    const dispatch = useDispatch();

    const allLogs = useSelector((state: RootState) => state.logging.entryList);

    return {
        logMessage: (message: string) => {
            console.log(message);
            dispatch(pushEntry({ type: LogType.LOG, message }));
        },
        logInfo: (message: string) => {
            console.info(message);
            dispatch(pushEntry({ type: LogType.INFO, message }));
        },
        logError: (message: string) => {
            console.error(message);
            dispatch(pushEntry({ type: LogType.ERROR, message }));
        },
        logWarning: (message: string) => {
            console.warn(message);
            dispatch(pushEntry({ type: LogType.WARNING, message }));
        },

        listAllLogs: () => allLogs,
        listMessageLogs: () => allLogs.filter((l) => l.logType === 'log') as Array<LogEntry<LogType.LOG>>,
        listInfoLogs: () => allLogs.filter((l) => l.logType === 'info') as Array<LogEntry<LogType.INFO>>,
        listErrorLogs: () => allLogs.filter((l) => l.logType === 'error') as Array<LogEntry<LogType.ERROR>>,
        listWarningLogs: () => allLogs.filter((l) => l.logType === 'warning') as Array<LogEntry<LogType.WARNING>>,
    };
};

export default useLogging;
