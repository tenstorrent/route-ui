// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent Inc.

import { useCallback, useState } from 'react';
import { Queue } from '../../../data/GraphTypes';
import {
    type AllocationInfoJson,
    type QueueBlockDimensions,
    QueueDetailsJson,
} from '../../../data/sources/QueueDescriptor';
import useSelectedTableRows from '../../hooks/useSelectableTableRows.hook';
import { DataTableColumnDefinition, SortingDirection, sortAsc, sortDesc } from './SharedTable';

export interface QueuesTableFields extends QueueDetailsJson {
    queue?: Queue;
    name: string;
}

type QueuesTableColumn = keyof QueuesTableFields | 'queue' | `blockDimensions.${keyof QueueBlockDimensions}`;

const queuesTableColumns: Map<QueuesTableColumn, DataTableColumnDefinition<QueuesTableFields>> = new Map();

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

queuesTableColumns.set('device-id', {
    label: 'Device ID',
    sortable: true,
    align: 'left',
    formatter: (value) => value.toString(),
});

queuesTableColumns.set('source-device-id', {
    label: 'Source Device ID',
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

queuesTableColumns.set('blockDimensions.t', {
    lookupProperty: 'blockDimensions',
    label: 't (block dim)',
    sortable: true,
    align: 'left',
    formatter: (value: QueueBlockDimensions) => value.t.toString(),
});
queuesTableColumns.set('blockDimensions.mblock_m', {
    lookupProperty: 'blockDimensions',
    label: 'mblock_m (block dim)',
    sortable: true,
    align: 'left',
    formatter: (value: QueueBlockDimensions) => value.mblock_m.toString(),
});
queuesTableColumns.set('blockDimensions.mblock_n', {
    lookupProperty: 'blockDimensions',
    label: 'mblock_n (block dim)',
    sortable: true,
    align: 'left',
    formatter: (value: QueueBlockDimensions) => value.mblock_n.toString(),
});
queuesTableColumns.set('blockDimensions.ublock_ct', {
    lookupProperty: 'blockDimensions',
    label: 'ublock_ct (block dim)',
    sortable: true,
    align: 'left',
    formatter: (value: QueueBlockDimensions) => value.ublock_ct.toString(),
});
queuesTableColumns.set('blockDimensions.ublock_rt', {
    lookupProperty: 'blockDimensions',
    label: 'ublock_rt (block dim)',
    sortable: true,
    align: 'left',
    formatter: (value: QueueBlockDimensions) => value.ublock_rt.toString(),
});
queuesTableColumns.set('blockDimensions.ublock_order', {
    lookupProperty: 'blockDimensions',
    label: 'ublock_order (block dim)',
    sortable: true,
    align: 'left',
    formatter: (value: QueueBlockDimensions) => value.ublock_order.toString(),
});

queuesTableColumns.set('tile-dim', {
    label: 'Tile Dimensions',
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
    label: 'Location',
    sortable: true,
    align: 'left',
    formatter: (value) => value.toString(),
});

queuesTableColumns.set('allocation-info', {
    label: 'Allocation Info',
    sortable: true,
    align: 'left',
    formatter: (value: AllocationInfoJson[]) =>
        value
            .map((info) => {
                const subchannel = info.subchannel > -1 ? ` Sub CH: ${info.subchannel}` : '';
                const channel = `CH: ${info.channel}${subchannel}`;

                return `${info.address} (${channel})`;
            })
            .join(', '),
});

const useQueuesTable = () => {
    const { handleSelectAllQueues, getQueuesSelectedState } = useSelectedTableRows();
    const [sortingColumn, setSortingColumn] = useState<QueuesTableColumn>('entries');
    const [sortDirection, setSortDirection] = useState<SortingDirection>(SortingDirection.DESC);

    const sortTableFields = useCallback(
        (queuesList: QueuesTableFields[]) => {
            const tableFields = queuesList;
            const sortingFunction = sortDirection === SortingDirection.ASC ? sortAsc : sortDesc;

            if (sortingColumn === 'queue') {
                return tableFields.sort((a, b) => sortingFunction(a.name, b.name));
            }

            if (sortingColumn.startsWith('blockDimensions.')) {
                const [column, subcolumn] = sortingColumn.split('.') as ['blockDimensions', keyof QueueBlockDimensions];

                return tableFields.sort((a, b) =>
                    sortingFunction(a?.[column]?.[subcolumn] ?? '', b?.[column]?.[subcolumn] ?? ''),
                );
            }

            return tableFields.sort((a, b) =>
                sortingFunction(
                    a?.[sortingColumn as keyof QueuesTableFields] ?? '',
                    b?.[sortingColumn as keyof QueuesTableFields] ?? '',
                ),
            );
        },
        [sortingColumn, sortDirection],
    );
    const changeSorting = (selectedColumn: QueuesTableColumn) => (direction: SortingDirection) => {
        setSortDirection(direction);
        setSortingColumn(selectedColumn);
    };

    queuesTableColumns.get('queue')!.handleSelectAll = handleSelectAllQueues;
    queuesTableColumns.get('queue')!.getSelectedState = getQueuesSelectedState;

    return { sortTableFields, changeSorting, sortingColumn, sortDirection, queuesTableColumns };
};

export default useQueuesTable;
