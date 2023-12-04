/* eslint-disable react/destructuring-assignment */
import { Table2, Column, Cell } from '@blueprintjs/table';
import { OpPerfJSON } from 'data/sources/PerfAnalyzerResults';
import useOperationsTable from './useOperationsTable.hooks';
import OperationsTableDictionary from './operationsTable.dict';

function OperationsTable() {
    const { operations } = useOperationsTable();

    const operationRenderer = (rowIndex: number) => <Cell>{operations[rowIndex].name}</Cell>;

    const cellRenderer = (key: keyof OpPerfJSON, rowIndex: number) => (
        <Cell>{String(operations[rowIndex]?.details?.[key])} </Cell>
    );

    if (!operations.length) {
        return <pre>No data available</pre>;
    }

    return (
        <Table2 className='operations-table' numRows={operations.length} enableColumnHeader>
            <Column name={OperationsTableDictionary.operation} cellRenderer={operationRenderer} />
            <Column
                name={OperationsTableDictionary.grid_size}
                cellRenderer={(rowIndex) => cellRenderer('grid_size', rowIndex)}
            />
            <Column
                name={OperationsTableDictionary.kernel_total_runtime}
                cellRenderer={(rowIndex) => cellRenderer('kernel_total_runtime', rowIndex)}
            />
            <Column
                name={OperationsTableDictionary.kernel_math_utilization}
                cellRenderer={(rowIndex) => cellRenderer('kernel_math_utilization', rowIndex)}
            />
            <Column
                name={OperationsTableDictionary.bw_limited_factor}
                cellRenderer={(rowIndex) => cellRenderer('bw_limited_factor', rowIndex)}
            />
            <Column
                name={OperationsTableDictionary.slowest_operand}
                cellRenderer={(rowIndex) => cellRenderer('slowest_operand', rowIndex)}
            />
            <Column
                name={OperationsTableDictionary.bw_bound_total_runtime}
                cellRenderer={(rowIndex) => cellRenderer('bw_bound_total_runtime', rowIndex)}
            />
            <Column
                name={OperationsTableDictionary.bw_bound_math_utilization}
                cellRenderer={(rowIndex) => cellRenderer('bw_bound_math_utilization', rowIndex)}
            />
        </Table2>
    );
}

export default OperationsTable;
