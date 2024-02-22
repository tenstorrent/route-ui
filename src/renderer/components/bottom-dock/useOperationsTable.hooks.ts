import { useMemo, useState } from 'react';
import { MeasurementDetails } from '../../../data/OpPerfDetails';
import { Operand } from '../../../data/Graph';
import { Operation } from '../../../data/GraphTypes';
import { DataTableColumnDefinition, sortAsc, sortDesc, SortingDirection } from './SharedTable';
import useSelectedTableRows from '../../hooks/useSelectableTableRows.hook';
import { numberFormatter, valueRatio } from '../../utils/numbers';

export interface OpTableFields extends MeasurementDetails {
    operation?: Operation;
    name: string;
    grid_size: number;
    core_id: string;
    slowestOperandRef?: Operand;
}

type OperationTableColumn = keyof OpTableFields | 'operation';

const operationsTableColumns: Map<OperationTableColumn, DataTableColumnDefinition<OpTableFields>> = new Map();

operationsTableColumns.set('operation', {
    label: 'Operation',
    sortable: true,
    align: 'left',
    canSelectAllRows: true,
    formatter: (value) => value.toString(),
});
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
operationsTableColumns.set('bw_limited_factor', {
    label: 'BW Limited Factor',
    sortable: true,
    align: 'right',
    formatter: (value) => numberFormatter(value),
});
operationsTableColumns.set('slowest_operand', {
    label: 'Slowest Operand',
    sortable: true,
    align: 'left',
    canSelectAllRows: true,
    formatter: (value: Operand) => value?.name ?? '',
});
operationsTableColumns.set('bw_bound_total_runtime', {
    label: 'BW Bound Total Runtime',
    sortable: true,
    align: 'right',
    formatter: (value) => numberFormatter(value, ' cycles', 0),
});
operationsTableColumns.set('bw_bound_math_utilization', {
    label: 'BW Bound Math Utilization',
    sortable: true,
    align: 'right',
    formatter: (value) => numberFormatter(value, '%'),
});
operationsTableColumns.set('model_runtime_per_input', {
    label: 'Model Estimate (cycles/input)',
    sortable: true,
    align: 'right',
    formatter: (value: number) => numberFormatter(value, '', 0),
});
operationsTableColumns.set('kernel_runtime_per_input', {
    label: 'Kernel Runtime (cycles/input)',
    sortable: true,
    align: 'right',
    formatter: (value: number) => numberFormatter(value, '', 0),
});
operationsTableColumns.set('model_math_utilization', {
    label: 'Model Math Utilization',
    sortable: true,
    align: 'right',
    formatter: (value) => numberFormatter(value, '%'),
});
operationsTableColumns.set('kernel_math_utilization', {
    label: 'Kernel Math Utilization',
    sortable: true,
    align: 'right',
    formatter: (value) => numberFormatter(value, '%'),
});
operationsTableColumns.set('kernel_total_runtime', {
    label: 'Kernel Total Runtime',
    sortable: true,
    align: 'right',
    formatter: (value) => numberFormatter(value, ' cycles', 0),
});
operationsTableColumns.set('bw_bound_runtime_per_input', {
    label: 'BW Bound Runtime (cycles/input)',
    sortable: true,
    align: 'right',
    formatter: (value) => numberFormatter(value, ' cycles', 0),
});

const useOperationsTable = (opList: OpTableFields[]) => {
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

    const maxModelEstimateRatio = useMemo(() => {
        const modelEstimates = opList.map((op) => valueRatio(op.model_runtime_per_input, op.kernel_runtime_per_input));

        return Math.ceil(Math.max(...modelEstimates));
    }, [opList]);

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
        maxModelEstimateRatio,
    };
};

export default useOperationsTable;
