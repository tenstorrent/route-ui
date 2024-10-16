// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent AI ULC

import { ColumnProps, RenderMode, SelectionModes, Table2 } from '@blueprintjs/table';
import { JSXElementConstructor, ReactElement, useContext, useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';
import { type Location, useLocation } from 'react-router-dom';
import { Spinner } from '@blueprintjs/core';
import { GraphVertexType } from '../../data/GraphNames';
import { GraphOnChipContext } from '../../data/GraphOnChipContext';
import { getOperandState } from '../../data/store/selectors/nodeSelection.selectors';
import useSelectableGraphVertex from '../../hooks/useSelectableGraphVertex.hook';
import SelectableOperation from '../SelectableOperation';
import { columnRenderer } from './SharedTable';
import useQueuesTableHook, { QueuesTableFields } from './useQueuesTable.hook';
import type { LocationState } from '../../data/StateTypes';
import AsyncComponent from '../AsyncRenderer';

/**
 * QueuesTable - temporary component to display queues
 * to be merged with OperationsTable as part of the next refactoring
 */
function QueuesTable() {
    const location: Location<LocationState> = useLocation();
    const { epoch: temporalEpoch, chipId } = location.state;
    const { getGraphOnChipListForTemporalEpoch, getOperand } = useContext(GraphOnChipContext);
    const graphOnChipList = getGraphOnChipListForTemporalEpoch(temporalEpoch, chipId);

    const { queuesTableColumns, sortTableFields, changeSorting, sortDirection, sortingColumn } = useQueuesTableHook();
    const operandState = useSelector(getOperandState);
    const tableFields = useMemo(() => {
        if (!graphOnChipList) {
            return [];
        }

        const list = [
            ...graphOnChipList
                .reduce((queueMap, { graphOnChip }) => {
                    [...graphOnChip.queues].forEach((queue) => {
                        if (!queueMap.has(queue.name)) {
                            queueMap.set(queue.name, {
                                name: queue.name,
                                ...queue.details,
                                chipId: graphOnChip.chipId,
                            } as unknown as QueuesTableFields);
                        }
                    });

                    return queueMap;
                }, new Map<string, QueuesTableFields>())
                .values(),
        ];

        return sortTableFields(list);
    }, [graphOnChipList, sortTableFields]);
    const { selected, selectOperand, navigateToGraph } = useSelectableGraphVertex();

    const table = useRef<Table2>(null);

    const queueCellRenderer = (rowIndex: number) => {
        const { name: queueName, queue } = tableFields[rowIndex]!;

        return queueName ? (
            <SelectableOperation
                opName={queueName}
                value={selected(queueName)}
                selectFunc={selectOperand}
                stringFilter=''
                type={GraphVertexType.QUEUE}
                offchip={queue?.isOffchip(chipId) ?? false}
                offchipClickHandler={navigateToGraph(queueName)}
            />
        ) : (
            ''
        );
    };

    const inputCellRenderer = (rowIndex: number) => {
        const { input, queue } = tableFields[rowIndex]!;

        if (input === 'HOST') {
            return 'HOST';
        }

        const operandDescriptor = getOperand(input);

        if (!operandDescriptor) {
            return 'N/A';
        }

        return (
            <SelectableOperation
                opName={operandDescriptor.name}
                selectFunc={selectOperand}
                stringFilter=''
                value={selected(operandDescriptor.name)}
                type={operandDescriptor.type}
                offchip={queue?.isOffchip(chipId) ?? false}
                offchipClickHandler={navigateToGraph(operandDescriptor.name)}
            />
        );
    };

    return (
        <AsyncComponent
            renderer={() => (
                <Table2
                    ref={table}
                    renderMode={RenderMode.NONE}
                    forceRerenderOnSelectionChange
                    selectionModes={SelectionModes.NONE}
                    className='queues-table'
                    numRows={tableFields.length}
                    rowHeights={[...new Array(tableFields.length)].fill(24)}
                    enableColumnHeader
                    numFrozenColumns={1}
                    cellRendererDependencies={[
                        sortDirection,
                        sortingColumn,
                        operandState,
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
                        ) as unknown as ReactElement<ColumnProps, JSXElementConstructor<any>>
                    }
                </Table2>
            )}
            loadingContent={
                <div className='table-loading'>
                    <Spinner />
                    <p>Loading queues</p>
                </div>
            }
        />
    );
}

export default QueuesTable;
