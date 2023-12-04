/* eslint-disable react/destructuring-assignment */
import { Table2, Column, Cell } from '@blueprintjs/table';
import { OpPerfJSON } from 'data/sources/PerfAnalyzerResults';
import useOperations from './useOperations.hooks';

function OperationsTable() {
    const { operations } = useOperations();

    const operationRenderer = (rowIndex: number) => <Cell>{operations[rowIndex].name}</Cell>;

    const cellRenderer = (key: keyof OpPerfJSON, rowIndex: number) => (
        <Cell>{String(operations[rowIndex]?.details?.[key])} </Cell>
    );

    if (!operations.length) {
        return <pre>No data available</pre>;
    }

    return (
        <Table2 className='operations-table' numRows={operations.length} enableColumnHeader>
            <Column name='Operation' cellRenderer={operationRenderer} />
            <Column name='Grid' cellRenderer={(rowIndex) => cellRenderer('grid_size', rowIndex)} />
            <Column
                name='Kernel Total Runtime'
                cellRenderer={(rowIndex) => cellRenderer('kernel_total_runtime', rowIndex)}
            />
            <Column
                name='Kernel Math Utilization'
                cellRenderer={(rowIndex) => cellRenderer('kernel_math_utilization', rowIndex)}
            />
            <Column name='BW Limited Factor' cellRenderer={(rowIndex) => cellRenderer('bw_limited_factor', rowIndex)} />
            <Column name='Slowest Operand' cellRenderer={(rowIndex) => cellRenderer('slowest_operand', rowIndex)} />
            <Column
                name='BW Bound Total Runtime'
                cellRenderer={(rowIndex) => cellRenderer('bw_bound_total_runtime', rowIndex)}
            />
            <Column
                name='BW Bound Math Utilization'
                cellRenderer={(rowIndex) => cellRenderer('bw_bound_math_utilization', rowIndex)}
            />
        </Table2>
    );
}

export default OperationsTable;
