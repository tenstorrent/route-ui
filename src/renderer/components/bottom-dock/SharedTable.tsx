import { ChangeEvent, JSXElementConstructor, ReactElement, JSX } from 'react';

import { Cell, Column, ColumnHeaderCell2, IColumnProps } from '@blueprintjs/table';
import { Checkbox, Icon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';

import type { NodeSelectionState } from '../../../data/StateTypes';
import type { OpTableFields } from './useOperationsTable.hooks';
import type { QueuesTableFields } from './useQueuesTable.hook';

export type TableFields = OpTableFields | QueuesTableFields;

export interface DataTableColumnDefinition<T extends TableFields> {
    label: string;
    sortable: boolean;
    align?: 'left' | 'right';
    canSelectAllRows?: boolean;
    getSelectedState?: (
        rows: T[],
        nodesSelectionState: NodeSelectionState,
    ) => 'checked' | 'unchecked' | 'indeterminate' | 'disabled';
    handleSelectAll?: (rows: T[], selected: boolean) => void;
    formatter: (index: number, rows: T[]) => string | JSX.Element;
}

export const simpleStringFormatter =
    <T extends TableFields, K extends keyof T>(key: K) =>
    (index: number, rows: T[]) => {
        return rows[index][key as keyof T]?.toString() ?? '';
    };

export enum SortingDirection {
    ASC = 'asc',
    DESC = 'desc',
}

export const sortAsc = (a: any, b: any) => {
    if (a === undefined || b === undefined) {
        return 0;
    }
    if (typeof a === 'string' && typeof b === 'number') {
        return 1;
    }
    if (a === b) {
        return 0;
    }
    return a > b ? 1 : -1;
};
export const sortDesc = (a: any, b: any) => {
    if (a === undefined || b === undefined) {
        return 0;
    }
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

        if (selectableRows.length === 0) {
            return 'disabled';
        }

        const selectedRows = selectableRows.filter((row) => {
            return getSelectionState(row);
        });

        if (selectedRows.length === 0) {
            return 'unchecked';
        }

        if (selectedRows.length === selectableRows.length) {
            return 'checked';
        }

        return 'indeterminate';
    };
};

interface HeaderRenderingProps<T extends TableFields> {
    definition?: DataTableColumnDefinition<T>;
    sortDirection: SortingDirection;
    sortingColumn: keyof T;
    column: keyof T;
    tableFields: T[];
    nodesSelectionState: NodeSelectionState;
    changeSorting: (column: keyof T) => (direction: SortingDirection) => void;
}

export const headerRenderer = <T extends TableFields>({
    definition,
    sortDirection,
    sortingColumn,
    column,
    tableFields,
    nodesSelectionState,
    changeSorting,
}: HeaderRenderingProps<T>) => {
    const sortDirectionClass = sortDirection === SortingDirection.ASC ? 'sorted-asc' : 'sorted-desc';
    const sortClass = `${sortingColumn === column ? 'current-sort' : ''} ${sortDirectionClass}`;
    let targetSortDirection = sortDirection;

    if (sortingColumn === column) {
        targetSortDirection = sortDirection === SortingDirection.ASC ? SortingDirection.DESC : SortingDirection.ASC;
    }

    const checkboxState = definition?.getSelectedState?.(tableFields, nodesSelectionState);
    const selectableClass = definition?.canSelectAllRows ? 'can-select-all-rows' : '';

    return (
        <ColumnHeaderCell2
            className={`${definition?.sortable ? sortClass : ''} ${selectableClass}`}
            name={definition?.label ?? (column as string)}
        >
            <>
                {definition?.sortable && (
                    <>
                        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/interactive-supports-focus */}
                        <div
                            className='sortable-table-header'
                            role='button'
                            onClick={() => changeSorting(column)(targetSortDirection)}
                        >
                            {sortingColumn === column && (
                                <span className='sort-icon'>
                                    <Icon
                                        icon={
                                            sortDirection === SortingDirection.ASC
                                                ? IconNames.SORT_ASC
                                                : IconNames.SORT_DESC
                                        }
                                    />
                                </span>
                            )}
                        </div>
                    </>
                )}
                {definition?.canSelectAllRows && (
                    <Checkbox
                        checked={checkboxState === 'checked'}
                        indeterminate={checkboxState === 'indeterminate'}
                        disabled={checkboxState === 'disabled'}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            definition.handleSelectAll?.(tableFields, e.target.checked)
                        }
                        className='sortable-table-checkbox'
                    />
                )}
            </>
        </ColumnHeaderCell2>
    );
};

interface CellRenderingProps<T extends TableFields> {
    definition?: DataTableColumnDefinition<T>;
    key: keyof T;
    rowIndex: number;
    tableFields: T[];
    isInteractive?: boolean;
    className?: string;
    customContent?: string | ReactElement;
}

export const cellRenderer = <T extends TableFields>({
    definition,
    key,
    rowIndex,
    tableFields,
    isInteractive,
    className,
    customContent,
}: CellRenderingProps<T>) => {
    const stringContent = definition?.formatter(rowIndex, tableFields) ?? '';

    const alignClass = definition?.align && `align-${definition?.align}`;

    return (
        <Cell
            interactive={isInteractive === true}
            key={`${key.toString()}-${rowIndex}`}
            className={[alignClass, className].join(' ')}
        >
            {customContent || stringContent}
        </Cell>
    );
};

export interface ColumnRendererProps<T extends TableFields> {
    key: keyof T;
    columnDefinition: Map<keyof T, DataTableColumnDefinition<T>>;
    changeSorting: (column: keyof T) => (direction: SortingDirection) => void;
    sortDirection: SortingDirection;
    sortingColumn: keyof T;
    tableFields: T[];
    nodesSelectionState: NodeSelectionState;
    isInteractive?: boolean;
    cellClassName?: string;
    customCellContentRenderer?: (rowIndex: number) => ReactElement | string;
}

export const columnRenderer = <T extends TableFields>({
    key,
    columnDefinition,
    changeSorting,
    sortDirection,
    sortingColumn,
    tableFields,
    nodesSelectionState,
    isInteractive,
    cellClassName,
    customCellContentRenderer,
}: ColumnRendererProps<T>): ReactElement<IColumnProps, JSXElementConstructor<any>> => {
    return (
        <Column
            key={key as string}
            id={key as string}
            cellRenderer={(rowIndex) =>
                cellRenderer({
                    definition: columnDefinition.get(key),
                    key,
                    rowIndex,
                    tableFields,
                    isInteractive,
                    className: [
                        cellClassName,
                        customCellContentRenderer ? 'table-cell-interactive table-operation-cell' : undefined,
                    ].join(' '),
                    customContent: customCellContentRenderer?.(rowIndex),
                })
            }
            columnHeaderCellRenderer={() =>
                headerRenderer({
                    definition: columnDefinition.get(key),
                    column: key,
                    changeSorting,
                    sortDirection,
                    sortingColumn,
                    tableFields,
                    nodesSelectionState,
                })
            }
        />
    );
};
