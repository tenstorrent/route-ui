// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent AI ULC

/* eslint-disable no-console */

import { useDispatch, useSelector } from 'react-redux';
import { pushEntry } from '../data/store/slices/logging.slice';
import { getOutputsToConsole } from '../data/store/selectors/logging.selector';

import { LogLevel } from '../data/Types';

interface LoggingHook {
    log: (message: string) => void;
    info: (message: string) => void;
    error: (message: string) => void;
    warn: (message: string) => void;
}

const useLogging = (): LoggingHook => {
    const dispatch = useDispatch();

    const outputsToConsole = useSelector(getOutputsToConsole);

    return {
        log: (message: string) => {
            if (outputsToConsole) {
                console.log(message);
            }

            dispatch(pushEntry({ type: LogLevel.LOG, message }));
        },
        info: (message: string) => {
            if (outputsToConsole) {
                console.info(message);
            }

            dispatch(pushEntry({ type: LogLevel.INFO, message }));
        },
        error: (message: string) => {
            if (outputsToConsole) {
                console.error(message);
            }

            dispatch(pushEntry({ type: LogLevel.ERROR, message }));
        },
        warn: (message: string) => {
            if (outputsToConsole) {
                console.warn(message);
            }

            dispatch(pushEntry({ type: LogLevel.WARNING, message }));
        },
    };
};

export default useLogging;
