import { Button, Checkbox, Icon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { IColumnProps, RenderMode, SelectionModes, Table2 } from '@blueprintjs/table';
import { ChangeEvent, JSXElementConstructor, ReactElement, useContext, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useOperationsTable, { OpTableFields } from './useOperationsTable.hooks';

import { ComputeNode } from '../../../data/Chip';
import { ChipContext } from '../../../data/ChipDataProvider';
import { GraphVertexType } from '../../../data/GraphNames';
import { Operation } from '../../../data/GraphTypes';
import { RootState } from '../../../data/store/createStore';
import { getOperationRatioThreshold } from '../../../data/store/selectors/operationPerf.selectors';
import { updateNodeSelection } from '../../../data/store/slices/nodeSelection.slice';
import useSelectableGraphVertex from '../../hooks/useSelectableGraphVertex.hook';
import { numberFormatter, valueRatio } from '../../utils/numbers';
import SearchField from '../SearchField';
import SelectableOperation, { SelectableOperationPerformance } from '../SelectableOperation';
import { columnRenderer } from './SharedTable';

// TODO: This component will benefit from refactoring. in the interest of introducing a useful feature sooner this is staying as is for now.
function OperationsTable() {
    const chip = useContext(ChipContext).getActiveChip();
    const dispatch = useDispatch();
    const [tableFields, setTableFields] = useState<OpTableFields[]>([]);
    const [coreView, setCoreView] = useState(false);
    const { operationsTableColumns, sortedTableFields, changeSorting, sortDirection, sortingColumn } =
        useOperationsTable(tableFields);
    const nodesSelectionState = useSelector((state: RootState) => state.nodeSelection);

    const { selected, selectOperation, disabledOperation, selectQueue, disabledQueue } = useSelectableGraphVertex();
    const table = useRef<Table2>(null);
    const operationRatioThreshold = useSelector(getOperationRatioThreshold);
    const [filterQuery, setFilterQuery] = useState<string>('');

    const updateOpTableDetails = (query?: string) => {
        if (!chip) {
            return;
        }

        let list = [...chip.operations].map((op) => {
            return {
                operation: op,
                name: op.name,
                ...op.details,
                slowestOperandRef: op.slowestOperand,
            } as unknown as OpTableFields;
        });

        if (query) {
            list = list.filter(({ operation }) => {
                return operation?.name.toLowerCase().includes(query.toLowerCase()) ?? true;
            });
        }

        setTableFields(list);
    };

    useEffect(() => {
        updateOpTableDetails();
        setCoreView(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chip]);

    if (!chip) {
        return (
            <div className='no-data-available'>
                <span>No data available</span>
            </div>
        );
    }

    const expandOperationCores = (opName: string) => {
        const operation = chip.getOperation(opName);
        if (operation === undefined) {
            return;
        }

        let list = [...operation.cores].map((core: ComputeNode) => {
            return {
                name: core.opName,
                ...core.perfAnalyzerResults,
                core_id: core.uid,
                slowestOperandRef: core.operation?.slowestOperand,
            } as OpTableFields;
        });

        if (filterQuery) {
            list = list.filter(({ operation: op }) => {
                return op?.name.toLowerCase().includes(filterQuery.toLowerCase()) ?? true;
            });
        }

        setCoreView(true);
        setTableFields(list);
    };

    const operationCellRenderer = (rowIndex: number) => {
        const opName = sortedTableFields[rowIndex].name;
        return (
            <>
                {opName ? (
                    <SelectableOperationPerformance operation={sortedTableFields[rowIndex].operation || null}>
                        <SelectableOperation
                            disabled={disabledOperation(opName)}
                            opName={opName}
                            value={selected(opName)}
                            selectFunc={selectOperation}
                            stringFilter={filterQuery}
                            type={GraphVertexType.OPERATION}
                        />
                    </SelectableOperationPerformance>
                ) : (
                    ''
                )}

                {coreView ? (
                    <Button
                        style={{ height: '18px' }}
                        small
                        minimal
                        title='Back to operations view'
                        icon={IconNames.ARROW_LEFT}
                        onClick={() => {
                            updateOpTableDetails();
                            setCoreView(false);
                        }}
                    />
                ) : (
                    <Button
                        style={{ height: '18px' }}
                        small
                        minimal
                        disabled={nodesSelectionState.operations[opName] === undefined}
                        title='View operation cores'
                        icon={IconNames.ARROW_RIGHT}
                        onClick={() => {
                            expandOperationCores(opName);
                        }}
                    />
                )}
            </>
        );
    };

    const coreIdCellRenderer = (rowIndex: number) => {
        const definition = operationsTableColumns.get('core_id');
        const cellContent = definition?.formatter(tableFields[rowIndex].core_id ?? '') ?? '';

        return (
            <div className='op-element'>
                <Checkbox
                    checked={nodesSelectionState.nodeList[cellContent]?.selected}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        dispatch(updateNodeSelection({ id: cellContent.toString(), selected: e.target.checked }));
                    }}
                />
                {cellContent}
            </div>
        );
    };

    const slowestOperandCellRenderer = (rowIndex: number) => {
        const slowOpString = tableFields[rowIndex].slowest_operand;
        const slowestOperand = tableFields[rowIndex].slowestOperandRef;

        if (slowestOperand) {
            const type: GraphVertexType = slowestOperand.vertexType;
            // <Cell className='table-cell-interactive table-operation-cell'>
            return (
                <>
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
                </>
            );
        }

        return slowOpString;
    };

    const modelRuntimeCellRenderer = (rowIndex: number) => {
        const value = tableFields[rowIndex].model_runtime_per_input;
        const ratio = valueRatio(value, tableFields[rowIndex].kernel_runtime_per_input);

        // eslint-disable-next-line no-restricted-globals
        if (isNaN(ratio)) {
            return numberFormatter(value, '', 0);
        }

        return (
            <span className='ratio-number'>
                {ratio > operationRatioThreshold && (
                    <Icon
                        size={10}
                        icon={IconNames.WARNING_SIGN}
                        title={`${numberFormatter(ratio)}x difference with "Kernel Runtime"`}
                    />
                )}
                <span>{numberFormatter(value, '', 0)}</span>
            </span>
        );
    };

    const getCustomCellRenderer = (key: string) => {
        switch (key) {
            case 'slowest_operand':
                return slowestOperandCellRenderer;
            case 'model_runtime_per_input':
                return modelRuntimeCellRenderer;
            default:
                return undefined;
        }
    };

    const excludedColumns = ['operation', 'grid_size', 'core_id'];
    const columns = Array.from(operationsTableColumns.keys()).filter((key) => !excludedColumns.includes(key));

    return (
        <>
            <div>
                <SearchField
                    disabled={coreView}
                    searchQuery={filterQuery}
                    onQueryChanged={(query) => {
                        setFilterQuery(query);
                        updateOpTableDetails(query);
                    }}
                    controls={[]}
                />
            </div>
            {tableFields.length > 0 ? (
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
                        operationRatioThreshold,
                        filterQuery,
                    ]}
                >
                    {columnRenderer({
                        key: 'operation',
                        columnDefinition: operationsTableColumns,
                        changeSorting,
                        sortDirection,
                        sortingColumn,
                        tableFields,
                        nodesSelectionState,
                        isInteractive: true,
                        customCellContentRenderer: operationCellRenderer,
                    })}
                    {!coreView
                        ? columnRenderer({
                              key: 'grid_size',
                              columnDefinition: operationsTableColumns,
                              changeSorting,
                              sortDirection,
                              sortingColumn,
                              tableFields,
                              nodesSelectionState,
                          })
                        : columnRenderer({
                              key: 'core_id',
                              columnDefinition: operationsTableColumns,
                              changeSorting,
                              sortDirection,
                              sortingColumn,
                              tableFields,
                              nodesSelectionState,
                              customCellContentRenderer: coreIdCellRenderer,
                          })}
                    {
                        columns.map((key) =>
                            columnRenderer({
                                key: key as keyof OpTableFields,
                                columnDefinition: operationsTableColumns,
                                changeSorting,
                                sortDirection,
                                sortingColumn,
                                tableFields,
                                nodesSelectionState,
                                customCellContentRenderer: getCustomCellRenderer(key),
                            }),
                        ) as unknown as ReactElement<IColumnProps, JSXElementConstructor<any>>
                    }
                </Table2>
            ) : (
                <div className='no-data-available'>
                    <span>No data available</span>
                </div>
            )}
        </>
    );
}

export default OperationsTable;
