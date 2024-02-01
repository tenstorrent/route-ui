import { ChangeEvent, useContext, useEffect, useRef, useState } from 'react';
import { Cell, Column, ColumnHeaderCell2, RenderMode, SelectionModes, Table2 } from '@blueprintjs/table';
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
import { DataTableColumnDefinition, SortingDirection } from './SharedTable';

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

    const getCheckboxState = (column: keyof OpTableFields | 'operations') => {
        if (column === 'core_id') {
            const selectedRows = tableFields.filter((row) => {
                const cellContent = row.core_id || '';
                return nodesSelectionState.nodeList[cellContent]?.selected;
            });

            if (selectedRows.length === 0) {
                return false;
            }

            if (selectedRows.length === tableFields.length) {
                return true;
            }
        }

        if (column === 'operation') {
            const selectedRows = tableFields.filter((row) => {
                return nodesSelectionState.operations[row.name]?.selected;
            });

            if (selectedRows.length === 0) {
                return false;
            }

            if (selectedRows.length === tableFields.length) {
                return true;
            }
        }

        if (column === 'slowest_operand') {
            const selectableRows = tableFields.filter((row) => {
                if (!row.slowestOperandRef) {
                    return false;
                }

                if (row.slowestOperandRef?.vertexType === GraphVertexType.OPERATION) {
                    return !disabledOperation(row.slowestOperandRef?.name ?? '');
                }

                return !disabledQueue(row.slowestOperandRef?.name ?? '');
            });

            const selectedRows = selectableRows.filter((row) => {
                if (row.slowestOperandRef?.vertexType === GraphVertexType.OPERATION) {
                    return nodesSelectionState.operations[row.slowestOperandRef?.name ?? '']?.selected;
                }

                return nodesSelectionState.queues[row.slowestOperandRef?.name ?? '']?.selected;
            });

            if (selectedRows.length === 0) {
                return false;
            }

            if (selectedRows.length === selectableRows.length) {
                return true;
            }
        }

        return undefined;
    };

    const handleSelectAll =
        (column: keyof OpTableFields | 'operations', definition: DataTableColumnDefinition) =>
        (e: ChangeEvent<HTMLInputElement>) => {
            const isChecked = e.target.checked;

            if (column === 'core_id') {
                tableFields.forEach((row) => {
                    const cellContent = definition?.formatter(row.core_id || '') ?? '';
                    selectNode(cellContent.toString(), isChecked);
                });
            }

            if (column === 'operation') {
                tableFields.forEach((row) => {
                    selectOperation(row.name, isChecked);
                });
            }

            if (column === 'slowest_operand') {
                const selectableRows = tableFields.filter((row) => {
                    if (!row.slowestOperandRef) {
                        return false;
                    }

                    if (row.slowestOperandRef?.vertexType === GraphVertexType.OPERATION) {
                        return !disabledOperation(row.slowestOperandRef?.name ?? '');
                    }

                    return !disabledQueue(row.slowestOperandRef?.name ?? '');
                });

                selectableRows.forEach((row) => {
                    if (row.slowestOperandRef?.vertexType === GraphVertexType.OPERATION) {
                        selectOperation(row.slowestOperandRef?.name ?? '', isChecked);
                    } else {
                        selectQueue(row.slowestOperandRef?.name ?? '', isChecked);
                    }
                });
            }
        };

    const headerRenderer = (column: keyof OpTableFields | 'operation') => {
        const currentSortClass = sortingColumn === column ? 'current-sort' : '';
        const sortDirectionClass = sortDirection === SortingDirection.ASC ? 'sorted-asc' : 'sorted-desc';
        let targetSortDirection = sortDirection;
        if (sortingColumn === column) {
            targetSortDirection = sortDirection === SortingDirection.ASC ? SortingDirection.DESC : SortingDirection.ASC;
        }

        const definition = operationsTableColumns.get(column);
        const checkboxState = definition?.canSelectAllRows && getCheckboxState(column);

        if (!definition?.sortable) {
            return (
                <ColumnHeaderCell2
                    name={definition?.label ?? column}
                    className={definition?.canSelectAllRows ? ' can-select-all-rows' : ''}
                >
                    {definition?.canSelectAllRows && (
                        <Checkbox
                            checked={checkboxState}
                            indeterminate={checkboxState === undefined}
                            onChange={handleSelectAll(column, definition)}
                            className='sortable-table-checkbox'
                        />
                    )}
                </ColumnHeaderCell2>
            );
        }
        return (
            <ColumnHeaderCell2
                className={`${currentSortClass} ${sortDirectionClass}${
                    definition.canSelectAllRows ? ' can-select-all-rows' : ''
                }`}
                name={definition.label}
            >
                <>
                    {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/interactive-supports-focus */}
                    <div
                        className='sortable-table-header'
                        role='button'
                        onClick={() => changeSorting(column)(targetSortDirection)}
                    >
                        {sortingColumn === column && (
                            <span className='sort-icon'>
                                <Icon
                                    icon={
                                        sortDirection === SortingDirection.ASC
                                            ? IconNames.SORT_ASC
                                            : IconNames.SORT_DESC
                                    }
                                />
                            </span>
                        )}
                    </div>
                    {definition?.canSelectAllRows && (
                        <Checkbox
                            checked={checkboxState}
                            indeterminate={checkboxState === undefined}
                            onChange={handleSelectAll(column, definition)}
                            className='sortable-table-checkbox'
                        />
                    )}
                </>
            </ColumnHeaderCell2>
        );
    };

    // TODO: value is not a good name, isSelected either, shoudl reveisit when a better name becomes available
    const selectNode = (id: string, value: boolean) => {
        dispatch(updateNodeSelection({ id, selected: value }));
    };

    const cellRenderer = (key: keyof OpTableFields, rowIndex: number): JSX.Element => {
        const definition = operationsTableColumns.get(key);
        const cellContent = definition?.formatter(tableFields[rowIndex][key] || '') ?? '';

        if (key === 'core_id') {
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
        }

        return <Cell className={definition?.align ? `align-${definition?.align}` : ''}>{cellContent}</Cell>;
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
                columnHeaderCellRenderer={() => headerRenderer('operation')}
            />
            {!coreView ? (
                <Column
                    cellRenderer={(rowIndex) => cellRenderer('grid_size', rowIndex)}
                    columnHeaderCellRenderer={() => headerRenderer('grid_size')}
                />
            ) : (
                <Column
                    cellRenderer={(rowIndex) => cellRenderer('core_id', rowIndex)}
                    columnHeaderCellRenderer={() => headerRenderer('core_id')}
                />
            )}
            <Column
                cellRenderer={(rowIndex) => cellRenderer('kernel_math_utilization', rowIndex)}
                columnHeaderCellRenderer={() => headerRenderer('kernel_math_utilization')}
            />
            <Column
                cellRenderer={(rowIndex) => cellRenderer('bw_limited_factor', rowIndex)}
                columnHeaderCellRenderer={() => headerRenderer('bw_limited_factor')}
            />
            <Column
                cellRenderer={(rowIndex) => slowestOperandCellRenderer(rowIndex)}
                columnHeaderCellRenderer={() => headerRenderer('slowest_operand')}
            />
            <Column
                cellRenderer={(rowIndex) => cellRenderer('bw_bound_total_runtime', rowIndex)}
                columnHeaderCellRenderer={() => headerRenderer('bw_bound_total_runtime')}
            />
            <Column
                cellRenderer={(rowIndex) => cellRenderer('bw_bound_math_utilization', rowIndex)}
                columnHeaderCellRenderer={() => headerRenderer('bw_bound_math_utilization')}
            />
            <Column
                cellRenderer={(rowIndex) => cellRenderer('model_runtime_per_input', rowIndex)}
                columnHeaderCellRenderer={() => headerRenderer('model_runtime_per_input')}
            />
            <Column
                cellRenderer={(rowIndex) => cellRenderer('kernel_runtime_per_input', rowIndex)}
                columnHeaderCellRenderer={() => headerRenderer('kernel_runtime_per_input')}
            />
            <Column
                cellRenderer={(rowIndex) => cellRenderer('kernel_total_runtime', rowIndex)}
                columnHeaderCellRenderer={() => headerRenderer('kernel_total_runtime')}
            />
        </Table2>
    );
}

export default OperationsTable;
