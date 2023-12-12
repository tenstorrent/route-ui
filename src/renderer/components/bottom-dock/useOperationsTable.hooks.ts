import DataSource from 'data/DataSource';
import { Operation } from 'data/GraphTypes';
import { OpPerfJSON } from 'data/sources/PerfAnalyzerResults';
import { useContext, useState } from 'react';
import { QueueDetailsJson } from '../../../data/sources/QueueDescriptor';

export type SortingDirection = 'asc' | 'desc';

export interface OperationsTableData {
    operation: string;
    grid_size: number;
    kernel_total_runtime: number;
    kernel_math_utilization: number;
    bw_limited_factor: number;
    slowest_operand: string;
    bw_bound_total_runtime: number;
    bw_bound_math_utilization: number;
}

type OperationsTableHook = {
    operations: Operation[];
    changeSorting: (selectedColumn: OperationTableColumn) => (direction: SortingDirection) => void;
    sortingColumn: OperationTableColumn;
    sortDirection: SortingDirection;
};

type OperationTableColumn = keyof OpPerfJSON | 'operation' ;

const sortAsc = (a: any, b: any) => (a > b ? 1 : -1);
const sortDesc = (a: any, b: any) => (a < b ? 1 : -1);

function useOperationsTable(opList: Operation[]): OperationsTableHook {
    const [sortingColumn, setSortingColumn] = useState<OperationTableColumn>('kernel_total_runtime');
    const [sortDirection, setSortDirection] = useState<SortingDirection>('desc');

    const operations = (() => {
        const inputOperations = opList;

            if (sortingColumn === 'operation') {
                const sortedOperations =
                    sortDirection === 'asc'
                        ? inputOperations.sort((a, b) => sortAsc(a.name, b.name))
                        : inputOperations.sort((a, b) => sortDesc(a.name, b.name));
                return sortedOperations;
            }

            const sortedOperations =
                sortDirection === 'asc'
                    ? inputOperations.sort((a, b) => sortAsc(
                        a.details ? a.details[sortingColumn] : '',
                        b.details ? b.details[sortingColumn] : '')
                    )
                    : inputOperations.sort((a, b) => sortDesc(
                        a.details ? a.details[sortingColumn] : '',
                        b.details ? b.details[sortingColumn] : '')
                    );
            return sortedOperations;
    })();

    const changeSorting = (selectedColumn: OperationTableColumn) => (direction: SortingDirection) => {
        setSortingColumn(selectedColumn);
        setSortDirection(direction);
    };
    return { operations, changeSorting, sortingColumn, sortDirection };
}

export default useOperationsTable;
