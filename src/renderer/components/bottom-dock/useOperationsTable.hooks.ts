import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { MeasurementDetails } from '../../../data/OpPerfDetails';
import { Operand } from '../../../data/Graph';
import { Operation } from '../../../data/GraphTypes';
import { DataTableColumnDefinition, sortAsc, sortDesc, SortingDirection } from './SharedTable';
import { updateNodeSelection } from '../../../data/store/slices/nodeSelection.slice';
import useSelectableGraphVertex from '../../hooks/useSelectableGraphVertex.hook';
import { GraphVertexType } from '../../../data/GraphNames';

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
    operationsTableColumns: Map<OperationTableColumn, DataTableColumnDefinition>;
};

type OperationTableColumn = keyof OpTableFields | 'operation';

const numberFormatter0 = Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
const numberFormatter2 = Intl.NumberFormat('en-US', { maximumFractionDigits: 2 });

const operationsTableColumns: Map<OperationTableColumn, DataTableColumnDefinition> = new Map();

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

const useOperationsTable = (opList: OpTableFields[]): OperationsTableHook => {
    const dispatch = useDispatch();
    const { selectOperation, disabledOperation, selectQueue, disabledQueue } = useSelectableGraphVertex();
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

    operationsTableColumns.get('core_id')!.handleSelectAll = (rows, selected) => {
        rows.forEach((row) => {
            dispatch(updateNodeSelection({ id: row.core_id || '', selected }));
        });
    };

    operationsTableColumns.get('core_id')!.getSelectedState = (rows, nodesSelectionState) => {
        const selectedRows = rows.filter((row) => {
            const cellContent = row.core_id || '';
            return nodesSelectionState.nodeList[cellContent]?.selected;
        });

        if (selectedRows.length === 0) {
            return false;
        }

        if (selectedRows.length === rows.length) {
            return true;
        }

        return undefined;
    };

    operationsTableColumns.get('operation')!.handleSelectAll = (rows: OpTableFields[], selected: boolean) => {
        rows.forEach((row) => {
            selectOperation(row.name, selected);
        });
    };

    operationsTableColumns.get('operation')!.getSelectedState = (rows: OpTableFields[], nodesSelectionState) => {
        const selectedRows = rows.filter((row) => {
            return nodesSelectionState.operations[row.name]?.selected;
        });

        if (selectedRows.length === 0) {
            return false;
        }

        if (selectedRows.length === rows.length) {
            return true;
        }

        return undefined;
    };

    operationsTableColumns.get('slowest_operand')!.handleSelectAll = (rows: OpTableFields[], selected: boolean) => {
        const selectableRows = rows.filter((row) => {
            if (!row.slowestOperandRef) {
                return false;
            }

            if (row.slowestOperandRef?.vertexType === GraphVertexType.OPERATION) {
                return !disabledOperation(row.slowestOperandRef?.name ?? '');
            }

            return !disabledQueue(row.slowestOperandRef?.name ?? '');
        });

        selectableRows.forEach((row) => {
            if (row.slowestOperandRef?.vertexType === GraphVertexType.OPERATION) {
                selectOperation(row.slowestOperandRef?.name ?? '', selected);
            } else {
                selectQueue(row.slowestOperandRef?.name ?? '', selected);
            }
        });
    };

    operationsTableColumns.get('slowest_operand')!.getSelectedState = (rows: OpTableFields[], nodesSelectionState) => {
        const selectableRows = rows.filter((row) => {
            if (!row.slowestOperandRef) {
                return false;
            }

            if (row.slowestOperandRef?.vertexType === GraphVertexType.OPERATION) {
                return !disabledOperation(row.slowestOperandRef?.name ?? '');
            }

            return !disabledQueue(row.slowestOperandRef?.name ?? '');
        });

        const selectedRows = selectableRows.filter((row) => {
            if (row.slowestOperandRef?.vertexType === GraphVertexType.OPERATION) {
                return nodesSelectionState.operations[row.slowestOperandRef?.name ?? '']?.selected;
            }

            return nodesSelectionState.queues[row.slowestOperandRef?.name ?? '']?.selected;
        });

        if (selectedRows.length === 0) {
            return false;
        }

        if (selectedRows.length === selectableRows.length) {
            return true;
        }

        return undefined;
    };

    const changeSorting = (selectedColumn: OperationTableColumn) => (direction: SortingDirection) => {
        setSortDirection(direction);
        setSortingColumn(selectedColumn);
    };
    return {
        sortedTableFields,
        changeSorting,
        sortingColumn,
        sortDirection,
        operationsTableColumns,
    };
};

export default useOperationsTable;
