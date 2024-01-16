import { FC, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Icon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { getLogEntries } from '../../data/store/selectors/logging.selector';
import { LogLevel } from '../../data/Types';

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

        switch (field) {
            case 'timestamp':
                cell = <Cell key={logLine.timestamp.toString()}>{formatter.format(new Date(logLine.timestamp))}</Cell>;
                break;
            case 'message':
                cell = (
                    <Cell key={logLine.timestamp.toString()}>
                        <code>
                            <pre className={`log-message log_${logLine.logType}`}>{logLine.message}</pre>
                        </code>
                    </Cell>
                );
                break;
            case 'logType':
                cell = (
                    <Cell key={logLine.timestamp.toString()} className={`log-type log_${logLine.logType}`}>
                        <Icon icon={ICON_MAP[logLine.logType]} />
                    </Cell>
                );
                break;
            default:
                break;
        }

        return cell;
    };

    return (
        <Table2
            ref={table}
            className='logs-table'
            renderMode={RenderMode.NONE}
            selectionModes={SelectionModes.NONE}
            numRows={logs.length}
            enableColumnHeader
            enableRowHeader={false}
            columnWidths={[190, 60, 800]}
            cellRendererDependencies={[logs, logs.length]}
        >
            <Column
                id='logs-timestamp'
                name='Timestamp'
                cellRenderer={(rowIndex) => cellRenderer('timestamp', rowIndex)}
            />
            <Column id='logs-type' name='Type' cellRenderer={(rowIndex) => cellRenderer('logType', rowIndex)} />
            <Column
                id='logs-message'
                name='Log Message'
                cellRenderer={(rowIndex) => cellRenderer('message', rowIndex)}
            />
        </Table2>
    );
};

export default LogsTable;
