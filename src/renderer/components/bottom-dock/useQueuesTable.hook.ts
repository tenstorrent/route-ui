import { useCallback, useState } from 'react';
import { Queue } from '../../../data/GraphTypes';
import { QueueDetailsJson } from '../../../data/sources/QueueDescriptor';
import useSelectedTableRows from '../../hooks/useSelectableTableRows.hook';
import { DataTableColumnDefinition, SortingDirection, sortAsc, sortDesc } from './SharedTable';

export interface QueuesTableFields extends QueueDetailsJson {
    queue?: Queue;
    name: string;
}

type QueueusTableColumn = keyof QueuesTableFields | 'queue';

const queuesTableColumns: Map<QueueusTableColumn, DataTableColumnDefinition<QueuesTableFields>> = new Map();

queuesTableColumns.set('queue', {
    label: 'Queue',
    sortable: true,
    align: 'left',
    canSelectAllRows: true,
    formatter: (value) => value.toString(),
});

queuesTableColumns.set('entries', {
    label: 'Entries',
    sortable: true,
    align: 'left',
    formatter: (value) => value.toString(),
});
queuesTableColumns.set('input', {
    label: 'Input',
    sortable: true,
    align: 'left',
    formatter: (value) => value.toString(),
});
queuesTableColumns.set('layout', {
    label: 'Layout',
    sortable: true,
    align: 'left',
    formatter: (value) => value.toString(),
});
queuesTableColumns.set('data-format', {
    label: 'Data Format',
    sortable: true,
    align: 'left',
    formatter: (value) => value.toString(),
});
queuesTableColumns.set('block-dim', {
    label: 'Block Dim',
    sortable: true,
    align: 'left',
    formatter: (value) => value.toString(),
});
queuesTableColumns.set('tile-dim', {
    label: 'Tile Dim',
    sortable: true,
    align: 'left',
    formatter: (value) => value.toString(),
});
queuesTableColumns.set('grid-size', {
    label: 'Grid Size',
    sortable: true,
    align: 'left',
    formatter: (value) => value.toString(),
});
queuesTableColumns.set('processedLocation', {
    label: 'Processed Location',
    sortable: true,
    align: 'left',
    formatter: (value) => value.toString(),
});

const useQueuesTable = () => {
    const { handleSelectAllQueues, getQueuesSelectedState } = useSelectedTableRows();
    const [sortingColumn, setSortingColumn] = useState<QueueusTableColumn>('entries');
    const [sortDirection, setSortDirection] = useState<SortingDirection>(SortingDirection.DESC);

    const sortTableFields = useCallback(
        (queuesList: QueuesTableFields[]) => {
            const tableFields = queuesList;

            if (sortingColumn === 'queue') {
                return sortDirection === SortingDirection.ASC
                    ? tableFields.sort((a, b) => sortAsc(a.name, b.name))
                    : tableFields.sort((a, b) => sortDesc(a.name, b.name));
            }

            return sortDirection === SortingDirection.ASC
                ? tableFields.sort((a, b) => sortAsc(a ? a[sortingColumn] : '', b ? b[sortingColumn] : ''))
                : tableFields.sort((a, b) => sortDesc(a ? a[sortingColumn] : '', b ? b[sortingColumn] : ''));
        },
        [sortingColumn, sortDirection],
    );
    const changeSorting = (selectedColumn: QueueusTableColumn) => (direction: SortingDirection) => {
        setSortDirection(direction);
        setSortingColumn(selectedColumn);
    };

    queuesTableColumns.get('queue')!.handleSelectAll = handleSelectAllQueues;
    queuesTableColumns.get('queue')!.getSelectedState = getQueuesSelectedState;

    return { sortTableFields, changeSorting, sortingColumn, sortDirection, queuesTableColumns };
};

export default useQueuesTable;
