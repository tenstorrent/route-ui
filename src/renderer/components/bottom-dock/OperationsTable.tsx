import React, { ChangeEvent, useContext, useEffect, useRef, useState } from 'react';
import { Cell, Column, ColumnHeaderCell2, RenderMode, SelectionModes, Table2 } from '@blueprintjs/table';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Checkbox, Icon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { JSX } from 'react/jsx-runtime';
import useOperationsTable, { OpTableFields, SortingDirection } from './useOperationsTable.hooks';
import SelectableOperation from '../SelectableOperation';
import { RootState } from '../../../data/store/createStore';
import { updateNodeSelection } from '../../../data/store/slices/nodeSelection.slice';
import DataSource from '../../../data/DataSource';
import { ComputeNode } from '../../../data/Chip';
import useSelectableGraphVertex from '../../hooks/useSelectableGraphVertex.hook';

// TODO: This component will benefit from refactoring. in the interest of introducing a useful feature sooner this is staying as is for now.
function OperationsTable() {
    const { chip } = useContext(DataSource);
    const dispatch = useDispatch();
    const [tableFields, setTableFields] = useState<OpTableFields[]>([]);
    const [coreView, setCoreView] = useState(false);
    const { operationsTableColumns, opTableFields, changeSorting, sortDirection, sortingColumn } =
        useOperationsTable(tableFields);
    const nodesSelectionState = useSelector((state: RootState) => state.nodeSelection);
    const { selected, selectOperation, disabledOperation } = useSelectableGraphVertex();
    const table = useRef<Table2>(null);


    const resetOpTableDetails = () => {
        if (!chip) {
            return;
        }

        setTableFields(
            [...chip.operations].map((op) => {
                return {
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
        const opName = opTableFields[rowIndex].name;
        return (
            <Cell interactive className='table-cell-interactive table-operation-cell'>
                {opName ? (
                    <SelectableOperation
                        disabled={disabledOperation(opName)}
                        opName={opName}
                        value={selected(opName)}
                        selectFunc={selectOperation}
                        stringFilter=''
                        type={null}
                    />
                ) : (
                    ''
                )}

                {!coreView && (
                    <Button
                        style={{ height: '18px' }}
                        small
                        minimal
                        disabled={nodesSelectionState.groups[opName] === undefined}
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

    const headerRenderer = (column: keyof OpTableFields | 'operation') => {
        const currentSortClass = sortingColumn === column ? 'current-sort' : '';
        const sortDirectionClass = sortDirection === SortingDirection.ASC ? 'sorted-asc' : 'sorted-desc';
        let targetSortDirection = sortDirection;
        if (sortingColumn === column) {
            targetSortDirection = sortDirection === SortingDirection.ASC ? SortingDirection.DESC : SortingDirection.ASC;
        }

        const definition = operationsTableColumns.get(column);

        if (!definition?.sortable) {
            return <ColumnHeaderCell2 name={definition?.label ?? column} />;
        }
        return (
            <ColumnHeaderCell2 className={`${currentSortClass} ${sortDirectionClass}`} name={definition.label}>
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

    // TODO: value is not a good name, isSelected either, shoudl reveisit when a better name becomes available
    const selectNode = (id: string, value: boolean) => {
        dispatch(updateNodeSelection({ id, selected: value }));
    };

    const cellRenderer = (key: keyof OpTableFields, rowIndex: number): JSX.Element => {
        let cellContent = tableFields[rowIndex][key] || '';
        const definition = operationsTableColumns.get(key);
        if (definition?.formatter) {
            cellContent = definition.formatter(cellContent);
        } else {
            cellContent = cellContent.toString();
        }
        const alignmentClass = definition?.align ? `align-${definition.align}` : '';
        const units = definition?.units ? `${definition.units}` : '';
        if (key === 'core_id') {
            return (
                <Cell>
                    <Checkbox
                        checked={nodesSelectionState.nodeList[cellContent]?.selected}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                            selectNode(cellContent.toString(), e.target.checked);
                        }}
                        label={cellContent + units}
                    />
                </Cell>
            );
        }

        return (
            <Cell className={alignmentClass}>
                {cellContent}
                {units}
            </Cell>
        );
    };

    const slowestOperandCellRenderer = (rowIndex: number): JSX.Element => {
        const slowOpString = tableFields[rowIndex].slowest_operand;
        const slowestOperand = tableFields[rowIndex].slowestOperandRef;
        if (slowestOperand) {
            return (
                <Cell className='table-cell-interactive table-operation-cell'>
                    {slowOpString.includes('output') ? (
                        <Icon size={12} icon={IconNames.EXPORT} title={slowOpString} />
                    ) : (
                        <Icon size={12} icon={IconNames.IMPORT} title={slowOpString} />
                    )}
                    <SelectableOperation
                        disabled={disabledOperation(slowestOperand.name)}
                        opName={slowestOperand.name}
                        value={selected(slowestOperand.name)}
                        selectFunc={selectOperation}
                        stringFilter=''
                        type={null}
                    />
                    <Button
                        style={{ height: '18px' }}
                        small
                        minimal
                        disabled={nodesSelectionState.groups[slowestOperand.name] === undefined}
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
                nodesSelectionState.groups,
                tableFields,
                coreView,
                opTableFields,
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
                cellRenderer={(rowIndex) => cellRenderer('kernel_total_runtime', rowIndex)}
                columnHeaderCellRenderer={() => headerRenderer('kernel_total_runtime')}
            />
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
        </Table2>
    );
}

export default OperationsTable;
