// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent Inc.

import { IColumnProps, RenderMode, SelectionModes, Table2 } from '@blueprintjs/table';
import { JSXElementConstructor, ReactElement, useContext, useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';
import { GraphVertexType } from '../../../data/GraphNames';
import { GraphOnChipContext } from '../../../data/GraphOnChipContext';
import { getOperationsState, getQueuesState } from '../../../data/store/selectors/nodeSelection.selectors';
import useSelectableGraphVertex from '../../hooks/useSelectableGraphVertex.hook';
import SelectableOperation from '../SelectableOperation';
import { columnRenderer } from './SharedTable';
import useQueuesTableHook, { QueuesTableFields } from './useQueuesTable.hook';

/**
 * QueuesTable - temporary component to display queues
 * to be merged with OperationsTable as part of the next refactoring
 */
function QueuesTable() {
    const { getActiveGraphOnChip, getActiveGraphName, getOperand } = useContext(GraphOnChipContext);
    const graphOnChip = getActiveGraphOnChip();
    const graphName = getActiveGraphName();
    const { queuesTableColumns, sortTableFields, changeSorting, sortDirection, sortingColumn } = useQueuesTableHook();
    const operationsState = useSelector(getOperationsState);
    const queuesState = useSelector(getQueuesState);
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
    const { selected, disabledQueue, selectOperation, selectQueue } = useSelectableGraphVertex();
    const table = useRef<Table2>(null);

    const queueCellRenderer = (rowIndex: number) => {
        const queueName = tableFields[rowIndex].name;

        return queueName ? (
            <SelectableOperation
                disabled={disabledQueue(queueName)}
                opName={queueName}
                value={selected(queueName)}
                selectFunc={() => selectQueue(queueName, !selected(queueName), graphName)}
                stringFilter=''
                type={GraphVertexType.QUEUE}
            />
        ) : (
            ''
        );
    };

    const inputCellRenderer = (rowIndex: number) => {
        const { input } = tableFields[rowIndex];

        if (input === 'HOST') {
            return 'HOST';
        }

        const operandDescriptor = getOperand(input);

        return (
            <SelectableOperation
                opName={input}
                disabled={!operandDescriptor}
                selectFunc={() => {
                    if (!operandDescriptor) {
                        return;
                    }

                    if (operandDescriptor.type === GraphVertexType.QUEUE) {
                        selectQueue(
                            operandDescriptor.name,
                            !selected(operandDescriptor.name, operandDescriptor.graphName),
                            operandDescriptor.graphName,
                        );
                    } else {
                        selectOperation(
                            operandDescriptor.name,
                            !selected(operandDescriptor.name, operandDescriptor.graphName),
                            operandDescriptor.graphName,
                        );
                    }
                }}
                stringFilter=''
                value={selected(operandDescriptor?.name ?? '', operandDescriptor?.graphName)}
                type={operandDescriptor?.type ?? GraphVertexType.OPERATION}
                offchip={operandDescriptor?.graphName !== getActiveGraphName()}
            />
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
                queuesState,
                operationsState,
                tableFields,
                tableFields.length,
            ]}
        >
            {
                [...queuesTableColumns.keys()].map((key) =>
                    columnRenderer({
                        key,
                        columnDefinition: queuesTableColumns,
                        changeSorting,
                        sortDirection,
                        sortingColumn,
                        tableFields,
                        ...(key === 'queue' && { customCellContentRenderer: queueCellRenderer }),
                        ...(key === 'input' && { customCellContentRenderer: inputCellRenderer }),
                    }),
                ) as unknown as ReactElement<IColumnProps, JSXElementConstructor<any>>
            }
        </Table2>
    );
}

export default QueuesTable;
