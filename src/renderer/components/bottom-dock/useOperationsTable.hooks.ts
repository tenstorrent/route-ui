import DataSource from 'data/DataSource';
import { Operation } from 'data/GraphTypes';
import { OpPerfJSON } from 'data/sources/PerfAnalyzerResults';
import { useContext, useMemo, useState } from 'react';

export type SortingDirection = 'asc' | 'desc';

type OperationsTableHook = {
    operations: Operation[];
    changeSorting: (selectedColumn: OperationTableColumn) => (direction: SortingDirection) => void;
    sortingColumn: OperationTableColumn;
    sortDirection: SortingDirection;
};

type OperationTableColumn = keyof OpPerfJSON | 'operation';

const sortAsc = (a: any, b: any) => (a > b ? 1 : -1);
const sortDesc = (a: any, b: any) => (a < b ? 1 : -1);

function useOperationsTable(): OperationsTableHook {
    const [sortingColumn, setSortingColumn] = useState<OperationTableColumn>('kernel_total_runtime');
    const [sortDirection, setSortDirection] = useState<SortingDirection>('desc');
    const { chip } = useContext(DataSource);
    const operations = useMemo(() => {
        const inputOperations = [...(chip?.operations ?? [])];
        // Netlist analyzer files do not load operation details, so this needs a protection block otherwise the sorting will crash the app

        try {
            if (sortingColumn === 'operation') {
                const sortedOperations =
                    sortDirection === 'asc'
                        ? inputOperations.sort((a, b) => sortAsc(a.name, b.name))
                        : inputOperations.sort((a, b) => sortDesc(a.name, b.name));
                return sortedOperations;
            }
            const sortedOperations =
                sortDirection === 'asc'
                    ? inputOperations.sort((a, b) => sortAsc(a.details![sortingColumn], b.details![sortingColumn]))
                    : inputOperations.sort((a, b) => sortDesc(a.details![sortingColumn], b.details![sortingColumn]));
            return sortedOperations;
        } catch (err) {
            const error = err as Error;
            console.error('error on selecting/sorting operators', error.message);
            return [];
        }
    }, [sortingColumn, chip, sortDirection]);

    const changeSorting = (selectedColumn: OperationTableColumn) => (direction: SortingDirection) => {
        setSortingColumn(selectedColumn);
        setSortDirection(direction);
    };
    return { operations, changeSorting, sortingColumn, sortDirection };
}

export default useOperationsTable;
