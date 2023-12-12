import { useState } from 'react';
import { MeasurementDetails } from '../../../data/OpPerfDetails';

export enum SortingDirection {
    ASC = 'asc',
    DESC = 'desc',
}

export interface OpTableFields extends MeasurementDetails {
    name: string;
    grid_size: number;
    core_id: string;
}

type OperationsTableHook = {
    opTableFields: OpTableFields[];
    changeSorting: (selectedColumn: OperationTableColumn) => (direction: SortingDirection) => void;
    sortingColumn: OperationTableColumn;
    sortDirection: SortingDirection;
};

type OperationTableColumn = keyof OpTableFields | 'operation';

const sortAsc = (a: any, b: any) => (a > b ? 1 : -1);
const sortDesc = (a: any, b: any) => (a < b ? 1 : -1);

function useOperationsTable(opList: OpTableFields[]): OperationsTableHook {
    const [sortingColumn, setSortingColumn] = useState<OperationTableColumn>('kernel_total_runtime');
    const [sortDirection, setSortDirection] = useState<SortingDirection>(SortingDirection.DESC);

    const opTableFields = (() => {
        const inputOperations = opList;

        if (sortingColumn === 'operation') {
            return sortDirection === SortingDirection.ASC
                ? inputOperations.sort((a, b) => sortAsc(a.name, b.name))
                : inputOperations.sort((a, b) => sortDesc(a.name, b.name));
        }

        return sortDirection === SortingDirection.ASC
            ? inputOperations.sort((a, b) => sortAsc(a ? a[sortingColumn] : '', b ? b[sortingColumn] : ''))
            : inputOperations.sort((a, b) => sortDesc(a ? a[sortingColumn] : '', b ? b[sortingColumn] : ''));
    })();

    const changeSorting = (selectedColumn: OperationTableColumn) => (direction: SortingDirection) => {
        setSortDirection(direction);
        setSortingColumn(selectedColumn);
    };
    return { opTableFields, changeSorting, sortingColumn, sortDirection };
}

export default useOperationsTable;
