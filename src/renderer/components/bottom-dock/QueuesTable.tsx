/**
 * SPDX-License-Identifier: Apache-2.0
 * SPDX-FileCopyrightText: © 2024 Tenstorrent Inc.
 */

import { IColumnProps, RenderMode, SelectionModes, Table2 } from '@blueprintjs/table';
import { JSXElementConstructor, ReactElement, useContext, useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';
import { GraphVertexType } from '../../../data/GraphNames';
import { GraphOnChipContext } from '../../../data/GraphOnChipContext';
import { getSelectedQueueList } from '../../../data/store/selectors/nodeSelection.selectors';
import useSelectableGraphVertex from '../../hooks/useSelectableGraphVertex.hook';
import SelectableOperation from '../SelectableOperation';
import { columnRenderer } from './SharedTable';
import useQueuesTableHook, { QueuesTableFields } from './useQueuesTable.hook';

/**
 * QueuesTable - temporary component to display queues
 * to be merged with OperationsTable as part of the next refactoring
 */
function QueuesTable() {
    const graphOnChip = useContext(GraphOnChipContext).getActiveGraphOnChip();
    const { queuesTableColumns, sortTableFields, changeSorting, sortDirection, sortingColumn } = useQueuesTableHook();
    const queueSelectionState = useSelector(getSelectedQueueList);
    const tableFields = useMemo(() => {
        if (!graphOnChip) {
            return [];
        }

        const list = [...graphOnChip.queues].map((queue) => {
            return {
                name: queue.name,
                ...queue.details,
            } as unknown as QueuesTableFields;
        });

        return sortTableFields(list);
    }, [graphOnChip, sortTableFields]);
    const { selected, selectQueue, disabledQueue } = useSelectableGraphVertex();
    const table = useRef<Table2>(null);

    const queueCellRenderer = (rowIndex: number) => {
        const queueName = tableFields[rowIndex].name;

        return queueName ? (
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
        );
    };

    return (
        <Table2
            ref={table}
            renderMode={RenderMode.NONE}
            forceRerenderOnSelectionChange
            selectionModes={SelectionModes.NONE}
            className='queues-table'
            numRows={tableFields.length}
            enableColumnHeader
            numFrozenColumns={1}
            cellRendererDependencies={[
                sortDirection,
                sortingColumn,
                queueSelectionState,
                tableFields,
                tableFields.length,
            ]}
        >
            {columnRenderer({
                key: 'queue',
                columnDefinition: queuesTableColumns,
                changeSorting,
                sortDirection,
                sortingColumn,
                tableFields,
                customCellContentRenderer: queueCellRenderer,
            })}
            {
                [...queuesTableColumns.keys()]
                    .filter((key) => key !== 'queue')
                    .map((key) =>
                        columnRenderer({
                            key,
                            columnDefinition: queuesTableColumns,
                            changeSorting,
                            sortDirection,
                            sortingColumn,
                            tableFields,
                        }),
                    ) as unknown as ReactElement<IColumnProps, JSXElementConstructor<any>>
            }
        </Table2>
    );
}

export default QueuesTable;
