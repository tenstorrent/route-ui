// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent AI ULC.

import { FC } from 'react';
import { useSelector } from 'react-redux';
import { Icon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { getLogEntries } from '../../data/store/selectors/logging.selector';
import { LogLevel } from '../../data/Types';

import './LogsOutput.scss';

const ICON_MAP = {
    [LogLevel.ERROR]: IconNames.ERROR,
    [LogLevel.WARNING]: IconNames.WARNING_SIGN,
    [LogLevel.INFO]: IconNames.INFO_SIGN,
    [LogLevel.LOG]: IconNames.HELP,
} as const;

const formatter = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    fractionalSecondDigits: 3,
});

const LogsOutput: FC = () => {
    const logs = useSelector(getLogEntries);
    // Reverse the logs so that the newest logs are at the top
    const reversedLogs = [...logs].reverse();

    return (
        <div className='logs-container'>
            {reversedLogs.map((log) => (
                <article key={log.timestamp} className={`log-message log-${log.logType}`}>
                    <span className='log-type'>
                        <Icon icon={ICON_MAP[log.logType]} />
                    </span>
                    <time className='log-timestamp' dateTime={new Date(log.timestamp).toISOString()}>
                        {formatter.format(log.timestamp)}
                    </time>
                    <Icon icon={IconNames.CHEVRON_RIGHT} />
                    <pre>{log.message}</pre>
                </article>
            ))}
        </div>
    );
};

export default LogsOutput;
