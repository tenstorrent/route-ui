export interface DataTableColumnDefinition {
    label: string;
    sortable: boolean;
    align?: 'left' | 'right';
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
