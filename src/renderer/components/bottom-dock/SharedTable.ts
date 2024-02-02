import type { NodeSelectionState } from '../../../data/StateTypes';
import type { OpTableFields } from './useOperationsTable.hooks';

export interface DataTableColumnDefinition {
    label: string;
    sortable: boolean;
    align?: 'left' | 'right';
    canSelectAllRows?: boolean;
    getSelectedState?: (rows: OpTableFields[], nodesSelectionState: NodeSelectionState) => boolean | undefined;
    handleSelectAll?: (rows: OpTableFields[], selected: boolean) => void;
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

export const handleSelectAll = (
    selectRow: (row: OpTableFields, selected: boolean) => void,
    getEnabledState?: (row: OpTableFields) => boolean,
) => {
    return (rows: OpTableFields[], selected: boolean) => {
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

export const getSelectedState = (
    getSelectionState: (row: OpTableFields) => boolean,
    getEnabledState?: (row: OpTableFields) => boolean,
) => {
    return (rows: OpTableFields[]) => {
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
