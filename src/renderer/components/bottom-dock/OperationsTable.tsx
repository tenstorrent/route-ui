// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent Inc.

import { Button, Checkbox, Icon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { IColumnProps, RenderMode, SelectionModes, Table2 } from '@blueprintjs/table';
import {
    ChangeEvent,
    JSXElementConstructor,
    ReactElement,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import useOperationsTable, { OpTableFields } from './useOperationsTable.hooks';

import { GraphVertexType } from '../../../data/GraphNames';
import { ComputeNode } from '../../../data/GraphOnChip';
import { GraphOnChipContext } from '../../../data/GraphOnChipContext';
import { Operation } from '../../../data/GraphTypes';
import { getOperandState, getSelectedNodeList } from '../../../data/store/selectors/nodeSelection.selectors';
import { getOperationRatioThreshold } from '../../../data/store/selectors/operationPerf.selectors';
import { updateNodeSelection } from '../../../data/store/slices/nodeSelection.slice';
import useSelectableGraphVertex from '../../hooks/useSelectableGraphVertex.hook';
import { numberFormatter, valueRatio } from '../../utils/numbers';
import SearchField from '../SearchField';
import SelectableOperation, { SelectableOperationPerformance } from '../SelectableOperation';
import { columnRenderer } from './SharedTable';

// TODO: This component will benefit from refactoring. in the interest of introducing a useful feature sooner this is staying as is for now.
function OperationsTable() {
    const location = useLocation();
    const { epoch: temporalEpoch } = location.state;
    const dispatch = useDispatch();
    const { getActiveGraphOnChip } = useContext(GraphOnChipContext);
    const graphOnChip = getActiveGraphOnChip();
    const { operationsTableColumns, sortTableFields, changeSorting, sortDirection, sortingColumn } =
        useOperationsTable();
    const [selectedOperationName, setSelectedOperationName] = useState('');
    const [filterQuery, setFilterQuery] = useState<string>('');
    const tableFields = useMemo(() => {
        if (!graphOnChip) {
            return [];
        }

        let list = [];
        const selectedOperation = graphOnChip.getOperation(selectedOperationName);

        if (selectedOperation) {
            list = [...selectedOperation.cores].map((core: ComputeNode) => {
                return {
                    name: core.opName,
                    ...core.perfAnalyzerResults,
                    core_id: core.uid,
                    slowestOperandRef: core.operation?.slowestOperand,
                } as OpTableFields;
            });
        } else {
            list = [...graphOnChip.operations].map((op) => {
                return {
                    operation: op,
                    name: op.name,
                    ...op.details,
                    slowestOperandRef: op.slowestOperand,
                } as unknown as OpTableFields;
            });
        }

        if (filterQuery) {
            list = list.filter(({ operation }) => {
                return operation?.name.toLowerCase().includes(filterQuery.toLowerCase()) ?? true;
            });
        }

        return sortTableFields(list);
    }, [graphOnChip, selectedOperationName, filterQuery, sortTableFields]);
    const nodesSelectionState = useSelector(getSelectedNodeList(temporalEpoch));
    const allOperandsState = useSelector(getOperandState);
    const { selectOperand, selected, navigateToGraph } = useSelectableGraphVertex();
    const table = useRef<Table2>(null);
    const operationRatioThreshold = useSelector(getOperationRatioThreshold);

    useEffect(() => {
        setSelectedOperationName('');
        setFilterQuery('');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [graphOnChip]);

    const operationCellRenderer = (rowIndex: number) => {
        const opName = tableFields[rowIndex].name;
        const operation = tableFields[rowIndex].operation || null;

        return (
            <span className='operand-wrapper'>
                {opName ? (
                    <SelectableOperationPerformance operation={tableFields[rowIndex].operation || null}>
                        <SelectableOperation
                            opName={opName}
                            value={selected(opName)}
                            selectFunc={selectOperand}
                            stringFilter={filterQuery}
                            type={GraphVertexType.OPERATION}
                            offchip={operation?.isOffchip}
                            offchipClickHandler={navigateToGraph(opName)}
                        >
                            <Button
                                style={{ height: '18px' }}
                                small
                                minimal
                                disabled={operation?.isOffchip}
                                title={selectedOperationName ? 'Back to operations view' : 'View operation cores'}
                                icon={selectedOperationName ? IconNames.ARROW_LEFT : IconNames.ARROW_RIGHT}
                                onClick={() => setSelectedOperationName(selectedOperationName ? '' : opName)}
                            />
                        </SelectableOperation>
                    </SelectableOperationPerformance>
                ) : (
                    ''
                )}
            </span>
        );
    };

    const coreIdCellRenderer = (rowIndex: number) => {
        const definition = operationsTableColumns.get('core_id');
        const cellContent = definition?.formatter(tableFields[rowIndex].core_id ?? '') ?? '';

        return (
            <div className='op-element'>
                <Checkbox
                    checked={nodesSelectionState[cellContent]?.selected}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        dispatch(
                            updateNodeSelection({
                                temporalEpoch,
                                id: cellContent.toString(),
                                selected: e.target.checked,
                            }),
                        );
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
            return (
                <span className='operand-wrapper slowest-operand-wrapper'>
                    {slowOpString.includes('output') ? (
                        <Icon size={12} icon={IconNames.EXPORT} title={slowOpString} />
                    ) : (
                        <Icon size={12} icon={IconNames.IMPORT} title={slowOpString} />
                    )}
                    <SelectableOperationPerformance
                        operation={type === GraphVertexType.OPERATION ? (slowestOperand as Operation) : null}
                    >
                        <SelectableOperation
                            opName={slowestOperand.name}
                            value={selected(slowestOperand.name)}
                            selectFunc={selectOperand}
                            stringFilter=''
                            type={slowestOperand.vertexType}
                            offchip={slowestOperand.isOffchip}
                            offchipClickHandler={navigateToGraph(slowestOperand.name)}
                        >
                            <Button
                                style={{ height: '18px' }}
                                small
                                minimal
                                disabled={slowestOperand.isOffchip}
                                icon={IconNames.ARROW_RIGHT}
                                onClick={() => {
                                    setSelectedOperationName(slowestOperand.name);
                                }}
                                title='View operation cores'
                            />
                        </SelectableOperation>
                    </SelectableOperationPerformance>
                </span>
            );
        }

        return slowOpString ?? 'N/A';
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

    const excludedColumn = !selectedOperationName ? 'core_id' : 'grid_size';
    const columns = Array.from(operationsTableColumns.keys()).filter((key) => excludedColumn !== key);

    return (
        <>
            <div>
                <SearchField
                    disabled={!graphOnChip || selectedOperationName !== ''}
                    searchQuery={filterQuery}
                    onQueryChanged={setFilterQuery}
                    controls={[]}
                />
            </div>
            <Table2
                ref={table}
                renderMode={RenderMode.NONE}
                forceRerenderOnSelectionChange
                selectionModes={SelectionModes.NONE}
                className='operations-table'
                numRows={tableFields.length}
                rowHeights={[...new Array(tableFields.length)].fill(24)}
                enableColumnHeader
                numFrozenColumns={1}
                cellRendererDependencies={[
                    sortDirection,
                    sortingColumn,
                    nodesSelectionState,
                    tableFields,
                    selectedOperationName,
                    tableFields.length,
                    operationRatioThreshold,
                    filterQuery,
                    allOperandsState,
                ]}
            >
                {
                    columns.map((key) =>
                        columnRenderer({
                            key: key as keyof OpTableFields,
                            columnDefinition: operationsTableColumns,
                            changeSorting,
                            sortDirection,
                            sortingColumn,
                            tableFields,
                            ...(key === 'model_runtime_per_input' && {
                                customCellContentRenderer: modelRuntimeCellRenderer,
                            }),
                            ...(key === 'slowest_operand' && { customCellContentRenderer: slowestOperandCellRenderer }),
                            ...(key === 'operation' && { customCellContentRenderer: operationCellRenderer }),
                            ...(key === 'core_id' && { customCellContentRenderer: coreIdCellRenderer }),
                        }),
                    ) as unknown as ReactElement<IColumnProps, JSXElementConstructor<any>>
                }
            </Table2>
        </>
    );
}

export default OperationsTable;
