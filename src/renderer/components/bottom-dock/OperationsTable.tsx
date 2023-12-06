import { Cell, Column, ColumnHeaderCell2, Table2 } from '@blueprintjs/table';
import { OpPerfJSON } from 'data/sources/PerfAnalyzerResults';
import { useCallback } from 'react';
import OperationsTableDictionary from './operationsTable.dict';
import SortingMenu from './shared/SortingMenu';
import useOperationsTable from './useOperationsTable.hooks';

function OperationsTable() {
    const { operations, changeSorting, sortDirection, sortingColumn } = useOperationsTable();

    const operationRenderer = (rowIndex: number) => <Cell>{operations[rowIndex].name}</Cell>;

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

    if (!operations.length) {
        return <pre>No data available</pre>;
    }

    return (
        <Table2
            className='operations-table'
            numRows={operations.length}
            enableColumnHeader
            cellRendererDependencies={[sortDirection, sortingColumn]}
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
