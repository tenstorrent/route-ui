import type { NodeSelectionState } from '../../../data/StateTypes';
import type { OpTableFields } from './useOperationsTable.hooks';
import type { QueuesTableFields } from './useQueuesTable.hook';

export type TableFields = OpTableFields | QueuesTableFields;

export interface DataTableColumnDefinition {
    label: string;
    sortable: boolean;
    align?: 'left' | 'right';
    canSelectAllRows?: boolean;
    getSelectedState?: <T extends TableFields>(
        rows: T[],
        nodesSelectionState: NodeSelectionState,
    ) => boolean | undefined;
    handleSelectAll?: <T extends TableFields>(rows: T[], selected: boolean) => void;
    formatter: (value: any) => string;
}

export enum SortingDirection {
    ASC = 'asc',
    DESC = 'desc',
}

export const sortAsc = (a: any, b: any) => {
    if (typeof a === 'string' && typeof b === 'number') {
        return 1;
    }
    if (a === b) {
        return 0;
    }
    return a > b ? 1 : -1;
};
export const sortDesc = (a: any, b: any) => {
    if (typeof a === 'string' && typeof b === 'number') {
        return 1;
    }
    if (a === b) {
        return 0;
    }
    return a < b ? 1 : -1;
};

export const handleSelectAll = <T extends TableFields>(
    selectRow: (row: T, selected: boolean) => void,
    getEnabledState?: (row: T) => boolean,
) => {
    return (rows: T[], selected: boolean) => {
        let selectableRows = rows;

        if (getEnabledState) {
            selectableRows = rows.filter((row) => {
                return getEnabledState(row);
            });
        }

        selectableRows.forEach((row) => {
            selectRow(row, selected);
        });
    };
};

export const getSelectedState = <T extends TableFields>(
    getSelectionState: (row: T) => boolean,
    getEnabledState?: (row: T) => boolean,
) => {
    return (rows: T[]) => {
        let selectableRows = rows;

        if (getEnabledState) {
            selectableRows = rows.filter((row) => {
                return getEnabledState(row);
            });
        }

        const selectedRows = selectableRows.filter((row) => {
            return getSelectionState(row);
        });

        if (selectedRows.length === 0) {
            return false;
        }

        if (selectedRows.length === selectableRows.length) {
            return true;
        }

        return undefined;
    };
};
