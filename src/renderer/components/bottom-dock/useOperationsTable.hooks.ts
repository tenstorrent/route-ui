import { useState } from 'react';
import { MeasurementDetails } from '../../../data/OpPerfDetails';
import { Operand } from '../../../data/Graph';
import { Operation } from '../../../data/GraphTypes';
import { DataTableColumnDefinition, simpleStringFormatter, sortAsc, sortDesc, SortingDirection } from './SharedTable';
import useSelectedTableRows from '../../hooks/useSelectableTableRows.hook';

const valueDelta = (a: number, b: number) => Math.abs(b - a);

export interface OpTableFields extends MeasurementDetails {
    operation?: Operation;
    name: string;
    grid_size: number;
    core_id: string;
    slowestOperandRef?: Operand;
}

type OperationsTableHook = {
    sortedTableFields: OpTableFields[];
    changeSorting: (selectedColumn: OperationTableColumn) => (direction: SortingDirection) => void;
    sortingColumn: OperationTableColumn;
    sortDirection: SortingDirection;
    operationsTableColumns: Map<OperationTableColumn, DataTableColumnDefinition<OpTableFields>>;
};

type OperationTableColumn = keyof OpTableFields | 'operation';

const numberFormatter0 = Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
const numberFormatter2 = Intl.NumberFormat('en-US', { maximumFractionDigits: 2 });

const operationsTableColumns: Map<OperationTableColumn, DataTableColumnDefinition<OpTableFields>> = new Map();

operationsTableColumns.set('grid_size', {
    label: 'Grid size',
    sortable: false,
    formatter: simpleStringFormatter('grid_size'),
});
operationsTableColumns.set('core_id', {
    label: 'Core ID',
    sortable: false,
    align: 'left',
    canSelectAllRows: true,
    formatter: simpleStringFormatter('core_id'),
});
operationsTableColumns.set('operation', {
    label: 'Operation',
    sortable: true,
    align: 'left',
    canSelectAllRows: true,
    formatter: simpleStringFormatter('name'),
});

operationsTableColumns.set('bw_bound_total_runtime', {
    label: 'BW Bound Total Runtime',
    sortable: true,
    align: 'right',
    formatter: (index, rows) => `${numberFormatter0.format(rows[index].bw_bound_total_runtime)} cycles`,
});
operationsTableColumns.set('kernel_total_runtime', {
    label: 'Kernel Total Runtime',
    sortable: true,
    align: 'right',
    formatter: (index, rows) => `${numberFormatter0.format(rows[index].kernel_total_runtime)} cycles`,
});

operationsTableColumns.set('bw_bound_runtime_per_input', {
    label: 'BW Bound Runtime (cycles per input)',
    sortable: true,
    align: 'right',
    formatter: (index, rows) => `${numberFormatter0.format(rows[index].bw_bound_runtime_per_input)} cycles`,
});
operationsTableColumns.set('kernel_runtime_per_input', {
    label: 'Kernel Runtime (cycles per input)',
    sortable: true,
    align: 'right',
    formatter: (index, rows) => `${numberFormatter0.format(rows[index].kernel_runtime_per_input)} cycles`,
});
operationsTableColumns.set('model_runtime_per_input', {
    label: 'Model Estimate (cycles/input)',
    sortable: true,
    align: 'right',
    formatter: (index, rows) => {
        const value = rows[index].model_runtime_per_input;

        // eslint-disable-next-line no-restricted-globals
        if (isNaN(value)) {
            return 'n/a';
        }

        const delta = valueDelta(rows[index].kernel_runtime_per_input, value);

        return `${numberFormatter0.format(value)} (${numberFormatter0.format(delta)} diff.)`;
    },
});
operationsTableColumns.set('kernel_runtime_per_input', {
    label: 'Kernel Runtime (cycles/input)',
    sortable: true,
    align: 'right',
    formatter: (index, rows) => {
        const value = rows[index].kernel_runtime_per_input;

        // eslint-disable-next-line no-restricted-globals
        if (isNaN(value)) {
            return 'n/a';
        }

        const delta = valueDelta(rows[index].model_runtime_per_input, value);

        return `${numberFormatter0.format(value)} (${numberFormatter0.format(delta)} diff.)`;
    },
});

operationsTableColumns.set('bw_bound_math_utilization', {
    label: 'BW Bound Math Utilization',
    sortable: true,
    align: 'right',
    formatter: (index, rows) => `${numberFormatter2.format(rows[index].bw_bound_math_utilization)}%`,
});
operationsTableColumns.set('kernel_math_utilization', {
    label: 'Kernel Math Utilization',
    sortable: true,
    align: 'right',
    formatter: (index, rows) => `${numberFormatter2.format(rows[index].kernel_math_utilization)}%`,
});
operationsTableColumns.set('model_math_utilization', {
    label: 'Model Math Utilization',
    sortable: true,
    align: 'right',
    formatter: (index, rows) => `${numberFormatter2.format(rows[index].model_math_utilization)}%`,
});

operationsTableColumns.set('bw_limited_factor', {
    label: 'BW Limited Factor',
    sortable: true,
    align: 'right',
    formatter: (index, rows) => numberFormatter2.format(rows[index].bw_limited_factor),
});

operationsTableColumns.set('slowest_operand', {
    label: 'Slowest Operand',
    sortable: true,
    align: 'left',
    canSelectAllRows: true,
    formatter: (index, rows) => rows[index].slowestOperandRef?.name ?? '',
});

const useOperationsTable = (opList: OpTableFields[]): OperationsTableHook => {
    const {
        handleSelectAllCores,
        handleSelectAllOperations,
        handleSelectAllSlowestOperands,
        getCoreSelectedState,
        getOperationSelectedState,
        getSlowestOperandSelectedState,
    } = useSelectedTableRows();
    const [sortingColumn, setSortingColumn] = useState<OperationTableColumn>('kernel_total_runtime');
    const [sortDirection, setSortDirection] = useState<SortingDirection>(SortingDirection.DESC);
    const sortedTableFields = (() => {
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

    operationsTableColumns.get('core_id')!.handleSelectAll = handleSelectAllCores;
    operationsTableColumns.get('core_id')!.getSelectedState = getCoreSelectedState;

    operationsTableColumns.get('operation')!.handleSelectAll = handleSelectAllOperations;
    operationsTableColumns.get('operation')!.getSelectedState = getOperationSelectedState;

    operationsTableColumns.get('slowest_operand')!.handleSelectAll = handleSelectAllSlowestOperands;
    operationsTableColumns.get('slowest_operand')!.getSelectedState = getSlowestOperandSelectedState;

    return {
        sortedTableFields,
        changeSorting,
        sortingColumn,
        sortDirection,
        operationsTableColumns,
    };
};

export default useOperationsTable;
