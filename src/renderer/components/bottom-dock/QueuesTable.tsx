import { JSXElementConstructor, ReactElement, useContext, useEffect, useRef, useState } from 'react';
import { Cell, Column, ColumnHeaderCell2, IColumnProps, RenderMode, SelectionModes, Table2 } from '@blueprintjs/table';
import { useSelector } from 'react-redux';
import { Icon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { JSX } from 'react/jsx-runtime';
import SelectableOperation from '../SelectableOperation';
import { RootState } from '../../../data/store/createStore';
import useSelectableGraphVertex from '../../hooks/useSelectableGraphVertex.hook';
import { GraphVertexType } from '../../../data/GraphNames';
import { SortingDirection } from './SharedTable';
import useQueuesTableHook, { QueuesTableFields } from './useQueuesTable.hook';
import { ChipContext } from '../../../data/ChipDataProvider';

/**
 * QueuesTable - temporary component to display queues
 * to be merged with OperationsTable as part of the next refactoring
 */
function QueuesTable() {
    const chip = useContext(ChipContext).getActiveChip();
    const [tableFields, setTableFields] = useState<QueuesTableFields[]>([]);
    const { queuesTableColumns, sortedTableFields, changeSorting, sortDirection, sortingColumn } =
        useQueuesTableHook(tableFields);
    const nodesSelectionState = useSelector((state: RootState) => state.nodeSelection);

    const { selected, selectQueue, disabledQueue } = useSelectableGraphVertex();
    const table = useRef<Table2>(null);

    useEffect(() => {
        if (!chip) {
            return;
        }
        const list = [...chip.queues].map((queue) => {
            return {
                name: queue.name,
                ...queue.details,
            } as unknown as QueuesTableFields;
        });
        setTableFields(list);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chip]);

    if (!chip) {
        return <pre>No data available</pre>;
    }

    const queueCellRenderer = (rowIndex: number) => {
        const queueName = sortedTableFields[rowIndex].name;
        return (
            <Cell interactive className='table-cell-interactive table-operation-cell'>
                {queueName ? (
                    <SelectableOperation
                        disabled={disabledQueue(queueName)}
                        opName={queueName}
                        value={selected(queueName)}
                        selectFunc={selectQueue}
                        stringFilter=''
                        type={GraphVertexType.QUEUE}
                    />
                ) : (
                    ''
                )}
            </Cell>
        );
    };

    const headerRenderer = (column: keyof QueuesTableFields) => {
        const currentSortClass = sortingColumn === column ? 'current-sort' : '';
        const sortDirectionClass = sortDirection === SortingDirection.ASC ? 'sorted-asc' : 'sorted-desc';
        let targetSortDirection = sortDirection;
        if (sortingColumn === column) {
            targetSortDirection = sortDirection === SortingDirection.ASC ? SortingDirection.DESC : SortingDirection.ASC;
        }

        const definition = queuesTableColumns.get(column);

        if (!definition?.sortable) {
            return <ColumnHeaderCell2 name={definition?.label ?? column} />;
        }
        return (
            <ColumnHeaderCell2 className={`${currentSortClass} ${sortDirectionClass}`} name={definition.label}>
                {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/interactive-supports-focus */}
                <div
                    className='sortable-table-header'
                    role='button'
                    onClick={() => changeSorting(column)(targetSortDirection)}
                >
                    {sortingColumn === column && (
                        <span className='sort-icon'>
                            <Icon
                                icon={sortDirection === SortingDirection.ASC ? IconNames.SORT_ASC : IconNames.SORT_DESC}
                            />
                        </span>
                    )}
                </div>
            </ColumnHeaderCell2>
        );
    };

    const cellRenderer = (key: keyof QueuesTableFields, rowIndex: number): JSX.Element => {
        const definition = queuesTableColumns.get(key);
        const cellContent = definition?.formatter(tableFields[rowIndex][key] || '') ?? '';

        return <Cell className={definition?.align ? `align-${definition?.align}` : ''}>{cellContent}</Cell>;
    };

    if (!tableFields.length) {
        return <pre>No data available</pre>;
    }

    const getColumn = (
        key: keyof QueuesTableFields,
    ): ReactElement<IColumnProps, string | JSXElementConstructor<any>> => {
        if (key === 'queue') {
            return (
                <Column
                    id='queue'
                    cellRenderer={(rowIndex) => queueCellRenderer(rowIndex)}
                    columnHeaderCellRenderer={() => headerRenderer('queue')}
                />
            );
        }
        return (
            <Column
                key={key}
                id={key}
                cellRenderer={(rowIndex) => cellRenderer(key, rowIndex)}
                columnHeaderCellRenderer={() => headerRenderer(key)}
            />
        );
    };

    return (
        <Table2
            ref={table}
            renderMode={RenderMode.NONE}
            forceRerenderOnSelectionChange
            selectionModes={SelectionModes.NONE}
            className='operations-table'
            numRows={tableFields.length}
            enableColumnHeader
            numFrozenColumns={1}
            cellRendererDependencies={[
                sortDirection,
                sortingColumn,
                nodesSelectionState.operations,
                nodesSelectionState.queues,
                nodesSelectionState.nodeList,
                tableFields,
                sortedTableFields,
                tableFields.length,
            ]}
        >
            {[...queuesTableColumns.keys()].map((key) => {
                return getColumn(key);
            })}
        </Table2>
    );
}

export default QueuesTable;
