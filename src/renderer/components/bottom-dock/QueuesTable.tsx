import { IColumnProps, RenderMode, SelectionModes, Table2 } from '@blueprintjs/table';
import { JSXElementConstructor, ReactElement, useContext, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { ChipContext } from '../../../data/ChipDataProvider';
import { GraphVertexType } from '../../../data/GraphNames';
import { RootState } from '../../../data/store/createStore';
import useSelectableGraphVertex from '../../hooks/useSelectableGraphVertex.hook';
import SelectableOperation from '../SelectableOperation';
import { columnRenderer } from './SharedTable';
import useQueuesTableHook, { QueuesTableFields } from './useQueuesTable.hook';

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

    if (!chip || !tableFields.length) {
        return <pre>No data available</pre>;
    }

    const queueCellRenderer = (rowIndex: number) => {
        const queueName = sortedTableFields[rowIndex].name;

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
                nodesSelectionState.operations,
                nodesSelectionState.queues,
                nodesSelectionState.nodeList,
                tableFields,
                sortedTableFields,
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
                nodesSelectionState,
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
                            nodesSelectionState,
                        }),
                    ) as unknown as ReactElement<IColumnProps, JSXElementConstructor<any>>
            }
        </Table2>
    );
}

export default QueuesTable;
