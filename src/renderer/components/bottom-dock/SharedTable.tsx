// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent AI ULC.

import { ChangeEvent, JSXElementConstructor, ReactElement } from 'react';

import { Checkbox, Icon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Cell, Column, ColumnHeaderCell2, IColumnProps } from '@blueprintjs/table';

import type { OpTableFields } from './useOperationsTable.hooks';
import type { QueuesTableFields } from './useQueuesTable.hook';

import './SharedTable.scss';

export type TableFields = OpTableFields | QueuesTableFields;

export interface DataTableColumnDefinition<T extends TableFields> {
    lookupProperty?: string;
    label: string;
    sortable: boolean;
    align?: 'left' | 'right';
    canSelectAllRows?: boolean;
    getSelectedState?: (rows: T[]) => 'checked' | 'unchecked' | 'indeterminate' | 'disabled';
    handleSelectAll?: (rows: T[], selected: boolean) => void;
    formatter: (value?: any) => string;
}

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
    sortingColumn: string;
    column: string;
    tableFields: T[];
    changeSorting: <K extends keyof T>(column: K) => (direction: SortingDirection) => void;
}

export const headerRenderer = <T extends TableFields>({
    definition,
    sortDirection,
    sortingColumn,
    column,
    tableFields,
    changeSorting,
}: HeaderRenderingProps<T>) => {
    const columnLabel = definition?.label ?? column.toString();
    const sortDirectionClass = sortDirection === SortingDirection.ASC ? 'sorted-asc' : 'sorted-desc';
    const sortClass = `${sortingColumn === column ? 'current-sort' : ''} ${sortDirectionClass}`;
    let targetSortDirection = sortDirection;

    if (sortingColumn === column) {
        targetSortDirection = sortDirection === SortingDirection.ASC ? SortingDirection.DESC : SortingDirection.ASC;
    }

    const checkboxState = definition?.getSelectedState?.(tableFields);
    const selectableClass = definition?.canSelectAllRows ? 'can-select-all-rows' : '';

    return (
        <ColumnHeaderCell2 className={`${definition?.sortable ? sortClass : ''} ${selectableClass}`} name={columnLabel}>
            <>
                {definition?.sortable && (
                    <>
                        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/interactive-supports-focus */}
                        <div
                            className='sortable-table-header'
                            role='button'
                            onClick={() => changeSorting(column as keyof T)(targetSortDirection)}
                            title={columnLabel}
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
    key: string;
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
    const propertyName = definition?.lookupProperty ?? key;
    const formattedContent = definition?.formatter(tableFields[rowIndex][propertyName as keyof T]) ?? '';

    const alignClass = (definition?.align && `align-${definition?.align}`) || '';

    return (
        <Cell
            interactive={isInteractive === true}
            key={`${propertyName.toString()}-${rowIndex}`}
            className={`${alignClass} ${className ?? ''}`}
        >
            {customContent || formattedContent}
        </Cell>
    );
};

export interface ColumnRendererProps<T extends TableFields> {
    key: string;
    columnDefinition: Map<string, DataTableColumnDefinition<T>>;
    changeSorting: <K extends keyof T>(column: K) => (direction: SortingDirection) => void;
    sortDirection: SortingDirection;
    sortingColumn: string;
    tableFields: T[];
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
    isInteractive,
    cellClassName,
    customCellContentRenderer,
}: ColumnRendererProps<T>): ReactElement<IColumnProps, JSXElementConstructor<any>> => {
    return (
        <Column
            key={key}
            id={key}
            cellRenderer={(rowIndex) =>
                cellRenderer({
                    definition: columnDefinition.get(key),
                    key,
                    rowIndex,
                    tableFields,
                    isInteractive,
                    className: `${cellClassName ?? ''} ${
                        customCellContentRenderer && 'table-cell-interactive table-operation-cell'
                    }`,
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
                })
            }
        />
    );
};
