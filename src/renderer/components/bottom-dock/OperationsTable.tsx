import React, { ChangeEvent, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Cell, Column, ColumnHeaderCell2, RenderMode, SelectionModes, Table2 } from '@blueprintjs/table';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Checkbox, Icon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import OperationsTableDictionary from './operationsTable.dict';
import useOperationsTable, { OpTableFields, SortingDirection } from './useOperationsTable.hooks';
import SelectableOperation from '../SelectableOperation';
import { RootState } from '../../../data/store/createStore';
import { selectGroup, updateNodeSelection } from '../../../data/store/slices/nodeSelection.slice';
import DataSource from '../../../data/DataSource';
import { ComputeNode } from '../../../data/Chip';

// TODO: This component will benefit from refactoring. in the interest of introducing a useful feature sooner this is staying as is for now.
function OperationsTable() {
    const { chip } = useContext(DataSource);
    const dispatch = useDispatch();
    const [tableFields, setTableFields] = useState<OpTableFields[]>([]);
    const [coreView, setCoreView] = useState(false);
    const { opTableFields, changeSorting, sortDirection, sortingColumn } = useOperationsTable(tableFields);
    const nodesSelectionState = useSelector((state: RootState) => state.nodeSelection);
    const [firstColumnWidth, setFirstColumnWidth] = useState(310);
    const setOperationSelectionState = (opName: string, selected: boolean) =>
        dispatch(
            selectGroup({
                opName,
                selected,
            }),
        );
    const table = useRef<Table2>(null);

    const recalculateFirstColumnWidth = useCallback(() => {
        const width = table.current?.locator?.getWidestVisibleCellInColumn(0) ?? 0;
        console.log('width', width);
        setFirstColumnWidth(width === 0 ? 310 : width + 80);
    }, [table, setFirstColumnWidth]);

    const resetOpTableDetails = () => {
        if (!chip) {
            return;
        }
        setTableFields(
            [...chip.operations].map((op) => {
                return { name: op.name, ...op.details } as unknown as OpTableFields;
            }),
        );
    };

    useEffect(() => {
        resetOpTableDetails();
        setCoreView(false);
    }, [chip]);

    if (!chip) {
        return <pre>No data available</pre>;
    }
    const expandOperationCores = (op: OpTableFields) => {
        const operation = chip.getOperation(op.name);
        if (operation === undefined) {
            return;
        }
        const list = [...operation.cores].map((core: ComputeNode) => {
            return { name: core.opName, ...core.perfAnalyzerResults, core_id: core.uid } as OpTableFields;
        });

        setCoreView(true);
        setTableFields(list);
    };

    const firstColumnCellRenderer = (rowIndex: number) => {
        const opName = opTableFields[rowIndex].name;
        return (
            <Cell interactive className='table-cell-interactive table-operation-cell'>
                {opName ? (
                    <SelectableOperation
                        opName={opName}
                        value={nodesSelectionState.groups[opName]?.selected}
                        selectFunc={setOperationSelectionState}
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
                        icon={IconNames.ARROW_RIGHT}
                        onClick={() => {
                            expandOperationCores(tableFields[rowIndex]);
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

    const headerRenderer = (column: keyof OpTableFields | 'operation', disableSorting?: boolean) => {
        const currentSortClass = sortingColumn === column ? 'current-sort' : '';
        const sortDirectionClass = sortDirection === SortingDirection.ASC ? 'sorted-asc' : 'sorted-desc';
        let targetSortDirection = sortDirection;
        if (sortingColumn === column) {
            targetSortDirection = sortDirection === SortingDirection.ASC ? SortingDirection.DESC : SortingDirection.ASC;
        }
        if (disableSorting) {
            return <ColumnHeaderCell2 name={OperationsTableDictionary[column]} />;
        }
        return (
            <div
                className='sortable-table-header'
                role='button'
                onClick={() => changeSorting(column)(targetSortDirection)}
            >
                <ColumnHeaderCell2
                    className={`${currentSortClass} ${sortDirectionClass}`}
                    name={OperationsTableDictionary[column]}
                />
                {sortingColumn === column && (
                    <span className='sort-icon'>
                        <Icon
                            icon={sortDirection === SortingDirection.ASC ? IconNames.SORT_ASC : IconNames.SORT_DESC}
                        />
                    </span>
                )}
            </div>
        );
    };

    const selectNode = (id: string, selected: boolean) => {
        dispatch(updateNodeSelection({ id, selected }));
    };

    const cellRenderer = (key: keyof OpTableFields, rowIndex: number) => {
        const cellContent = (tableFields[rowIndex][key] || '').toString();
        if (key === 'core_id') {
            return (
                <Cell>
                    <Checkbox
                        checked={nodesSelectionState.nodeList[cellContent]?.selected}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                            selectNode(cellContent, e.target.checked);
                        }}
                        label={cellContent}
                    />
                </Cell>
            );
        }
        return <Cell>{cellContent}</Cell>;
    };

    if (!tableFields.length) {
        return <pre>No data available</pre>;
    }

    const otherColWidth = null;

    return (
        <Table2
            ref={table}
            firstColumn
            renderMode={RenderMode.NONE}
            forceRerenderOnSelectionChange
            selectionModes={SelectionModes.NONE}
            className='operations-table'
            numRows={tableFields.length}
            enableColumnHeader
            onCompleteRender={recalculateFirstColumnWidth}
            // onCompleteRender={resizeColumns}
            columnWidths={[
                firstColumnWidth,
                otherColWidth,
                otherColWidth,
                otherColWidth,
                otherColWidth,
                otherColWidth,
                otherColWidth,
                otherColWidth,
            ]}
            // columnWidths={columnWidths}
            cellRendererDependencies={[
                firstColumnWidth,
                sortDirection,
                sortingColumn,
                nodesSelectionState.groups,
                tableFields,
                coreView,
            ]}
        >
            {/* TODO: render this in a simple loop maybe? */}
            <Column
                id='operation'
                cellRenderer={firstColumnCellRenderer}
                columnHeaderCellRenderer={() => headerRenderer('operation')}
            />
            {!coreView ? (
                <Column
                    cellRenderer={(rowIndex) => cellRenderer('grid_size', rowIndex)}
                    columnHeaderCellRenderer={() => headerRenderer('grid_size', true)}
                />
            ) : (
                <Column
                    cellRenderer={(rowIndex) => cellRenderer('core_id', rowIndex)}
                    columnHeaderCellRenderer={() => headerRenderer('core_id', true)}
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
                cellRenderer={(rowIndex) => cellRenderer('slowest_operand', rowIndex)}
                columnHeaderCellRenderer={() => headerRenderer('slowest_operand')}
            />
            <Column
                cellRenderer={(rowIndex) => cellRenderer('bw_bound_total_runtime', rowIndex)}
                columnHeaderCellRenderer={() => headerRenderer('bw_bound_total_runtime')}
            />
            <Column
                cellRenderer={(rowIndex) => cellRenderer(OperationsTableDictionary.bw_bound_math_utilization, rowIndex)}
                columnHeaderCellRenderer={() => headerRenderer('bw_bound_math_utilization')}
            />
        </Table2>
    );
}

export default OperationsTable;
