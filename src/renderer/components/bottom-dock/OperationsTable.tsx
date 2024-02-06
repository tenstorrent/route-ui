import { ChangeEvent, useContext, useEffect, useRef, useState } from 'react';
import { Cell, Column, RenderMode, SelectionModes, Table2 } from '@blueprintjs/table';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Checkbox, Icon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { JSX } from 'react/jsx-runtime';
import useOperationsTable, { OpTableFields } from './useOperationsTable.hooks';

import SelectableOperation, { SelectableOperationPerformance } from '../SelectableOperation';
import { RootState } from '../../../data/store/createStore';
import { updateNodeSelection } from '../../../data/store/slices/nodeSelection.slice';
import DataSource from '../../../data/DataSource';
import { ComputeNode } from '../../../data/Chip';
import useSelectableGraphVertex from '../../hooks/useSelectableGraphVertex.hook';
import { GraphVertexType } from '../../../data/GraphNames';
import { Operation } from '../../../data/GraphTypes';
import { columnRenderer, headerRenderer } from './SharedTable';

// TODO: This component will benefit from refactoring. in the interest of introducing a useful feature sooner this is staying as is for now.
function OperationsTable() {
    const { chip } = useContext(DataSource);
    const dispatch = useDispatch();
    const [tableFields, setTableFields] = useState<OpTableFields[]>([]);
    const [coreView, setCoreView] = useState(false);
    const { operationsTableColumns, sortedTableFields, changeSorting, sortDirection, sortingColumn } =
        useOperationsTable(tableFields);
    const nodesSelectionState = useSelector((state: RootState) => state.nodeSelection);

    const { selected, selectOperation, disabledOperation, selectQueue, disabledQueue } = useSelectableGraphVertex();
    const table = useRef<Table2>(null);

    const resetOpTableDetails = () => {
        if (!chip) {
            return;
        }

        setTableFields(
            [...chip.operations].map((op) => {
                return {
                    operation: op,
                    name: op.name,
                    ...op.details,
                    slowestOperandRef: op.slowestOperand,
                } as unknown as OpTableFields;
            }),
        );
    };

    useEffect(() => {
        resetOpTableDetails();
        setCoreView(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chip]);

    if (!chip) {
        return <pre>No data available</pre>;
    }
    const expandOperationCores = (opName: string) => {
        const operation = chip.getOperation(opName);
        if (operation === undefined) {
            return;
        }
        const list = [...operation.cores].map((core: ComputeNode) => {
            return {
                name: core.opName,
                ...core.perfAnalyzerResults,
                core_id: core.uid,
                slowestOperandRef: core.operation?.slowestOperand,
            } as OpTableFields;
        });

        setCoreView(true);
        setTableFields(list);
    };

    const operationCellRenderer = (rowIndex: number) => {
        const opName = sortedTableFields[rowIndex].name;
        return (
            <Cell interactive className='table-cell-interactive table-operation-cell'>
                {opName ? (
                    <SelectableOperationPerformance operation={sortedTableFields[rowIndex].operation || null}>
                        <SelectableOperation
                            disabled={disabledOperation(opName)}
                            opName={opName}
                            value={selected(opName)}
                            selectFunc={selectOperation}
                            stringFilter=''
                            type={GraphVertexType.OPERATION}
                        />
                    </SelectableOperationPerformance>
                ) : (
                    ''
                )}

                {!coreView && (
                    <Button
                        style={{ height: '18px' }}
                        small
                        minimal
                        disabled={nodesSelectionState.operations[opName] === undefined}
                        icon={IconNames.ARROW_RIGHT}
                        onClick={() => {
                            expandOperationCores(opName);
                        }}
                        title='View operation cores'
                    />
                )}

                {coreView && (
                    <Button
                        style={{ height: '18px' }}
                        small
                        minimal
                        title='Back to operations view'
                        icon={IconNames.ARROW_LEFT}
                        onClick={() => {
                            resetOpTableDetails();
                            setCoreView(false);
                        }}
                    />
                )}
            </Cell>
        );
    };

    // TODO: value is not a good name, isSelected either, shoudl reveisit when a better name becomes available
    const selectNode = (id: string, value: boolean) => {
        dispatch(updateNodeSelection({ id, selected: value }));
    };

    const coreIdCellRenderer = (key: keyof OpTableFields, rowIndex: number): JSX.Element => {
        const definition = operationsTableColumns.get(key);
        const cellContent = definition?.formatter(tableFields[rowIndex][key] || '') ?? '';

        return (
            <Cell>
                <Checkbox
                    checked={nodesSelectionState.nodeList[cellContent]?.selected}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        selectNode(cellContent.toString(), e.target.checked);
                    }}
                    label={cellContent}
                />
            </Cell>
        );
    };

    const slowestOperandCellRenderer = (rowIndex: number): JSX.Element => {
        const slowOpString = tableFields[rowIndex].slowest_operand;
        const slowestOperand = tableFields[rowIndex].slowestOperandRef;
        if (slowestOperand) {
            const type: GraphVertexType = slowestOperand.vertexType;
            return (
                <Cell className='table-cell-interactive table-operation-cell'>
                    {slowOpString.includes('output') ? (
                        <Icon size={12} icon={IconNames.EXPORT} title={slowOpString} />
                    ) : (
                        <Icon size={12} icon={IconNames.IMPORT} title={slowOpString} />
                    )}
                    <SelectableOperationPerformance
                        operation={type === GraphVertexType.OPERATION ? (slowestOperand as Operation) : null}
                    >
                        <SelectableOperation
                            disabled={
                                type === GraphVertexType.OPERATION
                                    ? disabledOperation(slowestOperand.name)
                                    : disabledQueue(slowestOperand.name)
                            }
                            opName={slowestOperand.name}
                            value={selected(slowestOperand.name)}
                            selectFunc={type === GraphVertexType.OPERATION ? selectOperation : selectQueue}
                            stringFilter=''
                            type={slowestOperand.vertexType}
                        />
                    </SelectableOperationPerformance>
                    <Button
                        style={{ height: '18px' }}
                        small
                        minimal
                        disabled={nodesSelectionState.operations[slowestOperand.name] === undefined}
                        icon={IconNames.ARROW_RIGHT}
                        onClick={() => {
                            expandOperationCores(slowestOperand.name);
                        }}
                        title='View operation cores'
                    />
                </Cell>
            );
        }
        return <Cell>{slowOpString}</Cell>;
    };

    if (!tableFields.length) {
        return <pre>No data available</pre>;
    }

    // TODO: i would like to automate iteration over the columns in the near future
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
                coreView,
                sortedTableFields,
                tableFields.length,
            ]}
        >
            <Column
                id='operation'
                cellRenderer={operationCellRenderer}
                columnHeaderCellRenderer={() =>
                    headerRenderer({
                        definition: operationsTableColumns.get('operation'),
                        column: 'operation',
                        changeSorting,
                        sortDirection,
                        sortingColumn,
                        tableFields,
                        nodesSelectionState,
                    })
                }
            />
            {!coreView ? (
                columnRenderer({
                    key: 'grid_size',
                    columnDefinition: operationsTableColumns,
                    changeSorting,
                    sortDirection,
                    sortingColumn,
                    tableFields,
                    nodesSelectionState,
                })
            ) : (
                <Column
                    cellRenderer={(rowIndex) => coreIdCellRenderer('core_id', rowIndex)}
                    columnHeaderCellRenderer={() =>
                        headerRenderer({
                            definition: operationsTableColumns.get('core_id'),
                            column: 'core_id',
                            changeSorting,
                            sortDirection,
                            sortingColumn,
                            tableFields,
                            nodesSelectionState,
                        })
                    }
                />
            )}
            {columnRenderer({
                key: 'kernel_math_utilization',
                columnDefinition: operationsTableColumns,
                changeSorting,
                sortDirection,
                sortingColumn,
                tableFields,
                nodesSelectionState,
            })}
            {columnRenderer({
                key: 'bw_limited_factor',
                columnDefinition: operationsTableColumns,
                changeSorting,
                sortDirection,
                sortingColumn,
                tableFields,
                nodesSelectionState,
            })}
            <Column
                cellRenderer={(rowIndex) => slowestOperandCellRenderer(rowIndex)}
                columnHeaderCellRenderer={() =>
                    headerRenderer({
                        definition: operationsTableColumns.get('slowest_operand'),
                        column: 'slowest_operand',
                        changeSorting,
                        sortDirection,
                        sortingColumn,
                        tableFields,
                        nodesSelectionState,
                    })
                }
            />
            {columnRenderer({
                key: 'bw_bound_total_runtime',
                columnDefinition: operationsTableColumns,
                changeSorting,
                sortDirection,
                sortingColumn,
                tableFields,
                nodesSelectionState,
            })}
            {columnRenderer({
                key: 'bw_bound_math_utilization',
                columnDefinition: operationsTableColumns,
                changeSorting,
                sortDirection,
                sortingColumn,
                tableFields,
                nodesSelectionState,
            })}
            {columnRenderer({
                key: 'model_runtime_per_input',
                columnDefinition: operationsTableColumns,
                changeSorting,
                sortDirection,
                sortingColumn,
                tableFields,
                nodesSelectionState,
            })}
            {columnRenderer({
                key: 'kernel_runtime_per_input',
                columnDefinition: operationsTableColumns,
                changeSorting,
                sortDirection,
                sortingColumn,
                tableFields,
                nodesSelectionState,
            })}
            {columnRenderer({
                key: 'kernel_total_runtime',
                columnDefinition: operationsTableColumns,
                changeSorting,
                sortDirection,
                sortingColumn,
                tableFields,
                nodesSelectionState,
            })}
        </Table2>
    );
}

export default OperationsTable;
