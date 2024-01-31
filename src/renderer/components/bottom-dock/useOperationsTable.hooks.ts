import { useState } from 'react';
import { MeasurementDetails } from '../../../data/OpPerfDetails';
import { Operand } from '../../../data/Graph';
import { Operation } from '../../../data/GraphTypes';

export enum SortingDirection {
    ASC = 'asc',
    DESC = 'desc',
}

export interface OperationTableColumnDefinition {
    label: string;
    sortable: boolean;
    align?: 'left' | 'right';
    canSelectAllRows?: boolean;
    formatter: (value: any) => string;
}

export interface OpTableFields extends MeasurementDetails {
    operation?: Operation;
    name: string;
    grid_size: number;
    core_id: string;
    slowestOperandRef?: Operand;
}

type OperationsTableHook = {
    opTableFields: OpTableFields[];
    changeSorting: (selectedColumn: OperationTableColumn) => (direction: SortingDirection) => void;
    sortingColumn: OperationTableColumn;
    sortDirection: SortingDirection;
    operationsTableColumns: Map<OperationTableColumn, OperationTableColumnDefinition>;
};

type OperationTableColumn = keyof OpTableFields | 'operation';

const numberFormatter0 = Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
const numberFormatter2 = Intl.NumberFormat('en-US', { maximumFractionDigits: 2 });

const operationsTableColumns: Map<OperationTableColumn, OperationTableColumnDefinition> = new Map();

operationsTableColumns.set('grid_size', {
    label: 'Grid size',
    sortable: false,
    formatter: (value) => value.toString(),
});
operationsTableColumns.set('core_id', {
    label: 'Core ID',
    sortable: false,
    align: 'left',
    canSelectAllRows: true,
    formatter: (value) => value.toString(),
});
operationsTableColumns.set('operation', {
    label: 'Operation',
    sortable: true,
    align: 'left',
    canSelectAllRows: true,
    formatter: (value) => value.toString(),
});

operationsTableColumns.set('bw_bound_total_runtime', {
    label: 'BW Bound Total Runtime',
    sortable: true,
    align: 'right',
    formatter: (value: number) => `${numberFormatter0.format(value)} cycles`,
});
operationsTableColumns.set('kernel_total_runtime', {
    label: 'Kernel Total Runtime',
    sortable: true,
    align: 'right',
    formatter: (value: number) => `${numberFormatter0.format(value)} cycles`,
});

operationsTableColumns.set('bw_bound_runtime_per_input', {
    label: 'BW Bound Runtime (cycles per input)',
    sortable: true,
    align: 'right',
    formatter: (value: number) => `${numberFormatter0.format(value)} cycles`,
});
operationsTableColumns.set('kernel_runtime_per_input', {
    label: 'Kernel Runtime (cycles per input)',
    sortable: true,
    align: 'right',
    formatter: (value: number) => `${numberFormatter0.format(value)} cycles`,
});
operationsTableColumns.set('model_runtime_per_input', {
    label: 'Model Estimate (cycles/input)',
    sortable: true,
    align: 'right',
    formatter: (value: number) => {
        // eslint-disable-next-line no-restricted-globals
        if (isNaN(value)) {
            return 'n/a';
        }
        return numberFormatter0.format(value);
    },
});
operationsTableColumns.set('kernel_runtime_per_input', {
    label: 'Kernel Runtime (cycles/input)',
    sortable: true,
    align: 'right',
    formatter: (value: number) => {
        // eslint-disable-next-line no-restricted-globals
        if (isNaN(value)) {
            return 'n/a';
        }

        return numberFormatter0.format(value);
    },
});

operationsTableColumns.set('bw_bound_math_utilization', {
    label: 'BW Bound Math Utilization',
    sortable: true,
    align: 'right',
    formatter: (value: number) => `${numberFormatter2.format(value)}%`,
});
operationsTableColumns.set('kernel_math_utilization', {
    label: 'Kernel Math Utilization',
    sortable: true,
    align: 'right',
    formatter: (value: number) => `${numberFormatter2.format(value)}%`,
});
operationsTableColumns.set('model_math_utilization', {
    label: 'Model Math Utilization',
    sortable: true,
    align: 'right',
    formatter: (value: number) => `${numberFormatter2.format(value)}%`,
});

operationsTableColumns.set('bw_limited_factor', {
    label: 'BW Limited Factor',
    sortable: true,
    align: 'right',
    formatter: (value: number) => numberFormatter2.format(value),
});

operationsTableColumns.set('slowest_operand', {
    label: 'Slowest Operand',
    sortable: true,
    align: 'left',
    canSelectAllRows: true,
    formatter: (value: Operand) => value.name,
});

const sortAsc = (a: any, b: any) => {
    if (typeof a === 'string' && typeof b === 'number') {
        return 1;
    }
    if (a === b) {
        return 0;
    }
    return a > b ? 1 : -1;
};
const sortDesc = (a: any, b: any) => {
    if (typeof a === 'string' && typeof b === 'number') {
        return 1;
    }
    if (a === b) {
        return 0;
    }
    return a < b ? 1 : -1;
};

function useOperationsTable(opList: OpTableFields[]): OperationsTableHook {
    const [sortingColumn, setSortingColumn] = useState<OperationTableColumn>('kernel_total_runtime');
    const [sortDirection, setSortDirection] = useState<SortingDirection>(SortingDirection.DESC);
    const opTableFields = (() => {
        const tableFields = opList;

        if (sortingColumn === 'operation') {
            return sortDirection === SortingDirection.ASC
                ? tableFields.sort((a, b) => sortAsc(a.name, b.name))
                : tableFields.sort((a, b) => sortDesc(a.name, b.name));
        }

        return sortDirection === SortingDirection.ASC
            ? tableFields.sort((a, b) => sortAsc(a ? a[sortingColumn] : '', b ? b[sortingColumn] : ''))
            : tableFields.sort((a, b) => sortDesc(a ? a[sortingColumn] : '', b ? b[sortingColumn] : ''));
    })();

    const changeSorting = (selectedColumn: OperationTableColumn) => (direction: SortingDirection) => {
        setSortDirection(direction);
        setSortingColumn(selectedColumn);
    };
    return { opTableFields, changeSorting, sortingColumn, sortDirection, operationsTableColumns };
}

export default useOperationsTable;
