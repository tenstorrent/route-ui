import { Cell, Column, ColumnHeaderCell2, RenderMode, SelectionModes, Table2 } from '@blueprintjs/table';
import { OpPerfJSON } from 'data/sources/PerfAnalyzerResults';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import OperationsTableDictionary from './operationsTable.dict';
import SortingMenu from './shared/SortingMenu';
import useOperationsTable from './useOperationsTable.hooks';
import SelectableOperation from '../SelectableOperation';
import { RootState } from '../../../data/store/createStore';
import { selectGroup } from '../../../data/store/slices/nodeSelection.slice';
import DataSource from '../../../data/DataSource';
import { Operation } from '../../../data/GraphTypes';

function OperationsTable() {
    const { chip } = useContext(DataSource);
    const dispatch = useDispatch();
    // TODO: map of operations or core with actual performance details. as table data. ish....
    const [opList, setOpList] = useState<Operation[]>([...(chip?.operations ?? [])]);
    const [drillDownLevel, setDrillDownLevel] = useState(0);
    const { operations, changeSorting, sortDirection, sortingColumn } = useOperationsTable(opList);
    const nodesSelectionState = useSelector((state: RootState) => state.nodeSelection);
    const setOperationSelectionState = (opName: string, selected: boolean) =>
        dispatch(
            selectGroup({
                opName,
                selected,
            }),
        );

    useEffect(() => {
        setOpList([...(chip?.operations ?? [])]);
    }, [chip]);

    const onExpandClick = (op: Operation) => {
        const list = [...op.cores]
            .map((core) => {
                return core.operation;
            })
            .filter((operation) => operation !== undefined) as Operation[];
        setDrillDownLevel(drillDownLevel + 1);
        setOpList(list);
    };

    const operationRenderer = (rowIndex: number) => {
        const opName = operations[rowIndex].name;
        // console.log(rowIndex, opName);
        return (
            <Cell interactive className='table-cell-interactive table-operation-cell'>
                <SelectableOperation
                    opName={opName}
                    value={nodesSelectionState.groups[opName]?.selected}
                    selectFunc={setOperationSelectionState}
                    stringFilter=''
                    type={null}
                />
                {/* {drillDownLevel === 0 && ( */}
                {/*     <Button */}
                {/*         style={{ height: '18px' }} */}
                {/*         small */}
                {/*         minimal */}
                {/*         icon={IconNames.ARROW_RIGHT} */}
                {/*         onClick={() => { */}
                {/*             onExpandClick(operations[rowIndex]); */}
                {/*         }} */}
                {/*     /> */}
                {/* )} */}
                {/* {drillDownLevel > 0 && ( */}
                {/*     <Button */}
                {/*         style={{ height: '18px' }} */}
                {/*         small */}
                {/*         minimal */}
                {/*         icon={IconNames.ARROW_LEFT} */}
                {/*         onClick={() => { */}
                {/*             setDrillDownLevel(0); */}
                {/*             setOpList([...(chip?.operations ?? [])]); */}
                {/*         }} */}
                {/*     /> */}
                {/* )} */}
            </Cell>
        );
    };

    const renderMenu = useCallback(
        (column: keyof OpPerfJSON | 'operation') => <SortingMenu sortFunction={changeSorting(column)} />,
        [changeSorting],
    );

    const headerRenderer = (column: keyof OpPerfJSON | 'operation') => (
        <ColumnHeaderCell2 name={OperationsTableDictionary[column]} menuRenderer={() => renderMenu(column)} />
    );

    const cellRenderer = (key: keyof OpPerfJSON, rowIndex: number) => {
        const cellContent = String(operations[rowIndex]?.details?.[key]);
        return <Cell>{cellContent}</Cell>;
    };

    if (!opList.length) {
        return <pre>No data available</pre>;
    }

    const otherColWidth = null;

    return (
        <Table2
            renderMode={RenderMode.NONE}
            forceRerenderOnSelectionChange
            selectionModes={SelectionModes.NONE}
            className='operations-table'
            numRows={opList.length}
            enableColumnHeader
            columnWidths={[
                290,
                otherColWidth,
                otherColWidth,
                otherColWidth,
                otherColWidth,
                otherColWidth,
                otherColWidth,
                otherColWidth,
            ]}
            cellRendererDependencies={[sortDirection, sortingColumn, nodesSelectionState.groups, opList]}
        >
            <Column
                name={OperationsTableDictionary.operation}
                cellRenderer={operationRenderer}
                columnHeaderCellRenderer={() => headerRenderer('operation')}
            />
            <Column
                name={OperationsTableDictionary.grid_size}
                cellRenderer={(rowIndex) => cellRenderer('grid_size', rowIndex)}
                columnHeaderCellRenderer={() => headerRenderer('grid_size')}
            />
            <Column
                name={OperationsTableDictionary.kernel_total_runtime}
                cellRenderer={(rowIndex) => cellRenderer('kernel_total_runtime', rowIndex)}
                columnHeaderCellRenderer={() => headerRenderer('kernel_total_runtime')}
            />
            <Column
                name={OperationsTableDictionary.kernel_math_utilization}
                cellRenderer={(rowIndex) => cellRenderer('kernel_math_utilization', rowIndex)}
                columnHeaderCellRenderer={() => headerRenderer('kernel_math_utilization')}
            />
            <Column
                name={OperationsTableDictionary.bw_limited_factor}
                cellRenderer={(rowIndex) => cellRenderer('bw_limited_factor', rowIndex)}
                columnHeaderCellRenderer={() => headerRenderer('bw_limited_factor')}
            />
            <Column
                name={OperationsTableDictionary.slowest_operand}
                cellRenderer={(rowIndex) => cellRenderer('slowest_operand', rowIndex)}
                columnHeaderCellRenderer={() => headerRenderer('slowest_operand')}
            />
            <Column
                name={OperationsTableDictionary.bw_bound_total_runtime}
                cellRenderer={(rowIndex) => cellRenderer('bw_bound_total_runtime', rowIndex)}
                columnHeaderCellRenderer={() => headerRenderer('bw_bound_total_runtime')}
            />
            <Column
                name={OperationsTableDictionary.bw_bound_math_utilization}
                cellRenderer={(rowIndex) => cellRenderer('bw_bound_math_utilization', rowIndex)}
                columnHeaderCellRenderer={() => headerRenderer('bw_bound_math_utilization')}
            />
        </Table2>
    );
}

export default OperationsTable;
