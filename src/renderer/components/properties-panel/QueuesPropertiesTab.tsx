// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent Inc.

import { Button, PopoverPosition } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Tooltip2 } from '@blueprintjs/popover2';
import { useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { selectOperandList } from '../../../data/store/slices/nodeSelection.slice';
import QueueIconMinus from '../../../main/assets/QueueIconMinus';
import QueueIconPlus from '../../../main/assets/QueueIconPlus';
import Collapsible from '../Collapsible';
import FilterableComponent from '../FilterableComponent';
import GraphVertexDetails from '../GraphVertexDetails';
import SearchField from '../SearchField';
import GraphVertexDetailsSelectables from '../GraphVertexDetailsSelectables';
import type GraphOnChip from '../../../data/GraphOnChip';
import type { GraphRelationship } from '../../../data/StateTypes';
import type { Queue } from '../../../data/GraphTypes';

const QueuesPropertiesTab = ({
    graphs,
    chipId,
}: {
    graphs: { graphOnChip: GraphOnChip; graph: GraphRelationship }[];
    chipId?: number;
}) => {
    const dispatch = useDispatch();
    const [allOpen, setAllOpen] = useState(true);
    const [filterQuery, setFilterQuery] = useState<string>('');
    const queuesList = useMemo(
        () => [
            ...graphs
                .reduce((queueMap, { graphOnChip }) => {
                    [...graphOnChip.queues].forEach((queue) => {
                        if (!queueMap.has(queue.name)) {
                            queueMap.set(queue.name, { queue, chipId: graphOnChip.chipId });
                        }
                    });

                    return queueMap;
                }, new Map<string, { queue: Queue; chipId: number }>())
                .values(),
        ],
        [graphs],
    );

    const updateFilteredQueueSelection = (selected: boolean) => {
        if (!queuesList.length) {
            return;
        }

        const filter = filterQuery.toLowerCase();
        const operands = queuesList.reduce<string[]>((filteredOperands, { queue: { name } }) => {
            if (name.toLowerCase().includes(filter)) {
                filteredOperands.push(name);
            }
            return filteredOperands;
        }, []);
        dispatch(selectOperandList({ operands, selected }));
    };

    return (
        <div className='properties-container'>
            <div className='properties-filter'>
                <SearchField
                    searchQuery={filterQuery}
                    onQueryChanged={setFilterQuery}
                    controls={[
                        <Tooltip2
                            content='Select all filtered queues'
                            position={PopoverPosition.RIGHT}
                            key='select-all-ops'
                        >
                            <Button icon={<QueueIconPlus />} onClick={() => updateFilteredQueueSelection(true)} />
                        </Tooltip2>,
                        <Tooltip2
                            content='Deselect all filtered queues'
                            position={PopoverPosition.RIGHT}
                            key='deselect-all-ops'
                        >
                            <Button icon={<QueueIconMinus />} onClick={() => updateFilteredQueueSelection(false)} />
                        </Tooltip2>,
                    ]}
                />
                <Button onClick={() => setAllOpen(true)} minimal rightIcon={IconNames.DOUBLE_CHEVRON_DOWN} />
                <Button onClick={() => setAllOpen(false)} minimal rightIcon={IconNames.DOUBLE_CHEVRON_UP} />
            </div>

            <div className='properties-list'>
                {queuesList.map(({ queue, chipId: queueChipId }, index) => (
                    <FilterableComponent
                        // eslint-disable-next-line react/no-array-index-key
                        key={`${index}-${queue.name}`}
                        filterableString={queue.name}
                        filterQuery={filterQuery}
                        component={
                            <Collapsible
                                // eslint-disable-next-line react/no-array-index-key
                                key={`collapsible-${index}-${queue.name}`}
                                label={
                                    <GraphVertexDetailsSelectables
                                        operand={queue}
                                        stringFilter={filterQuery}
                                        showType={false}
                                        isOffchip={chipId === undefined ? false : chipId !== queueChipId}
                                    />
                                }
                                isOpen={allOpen}
                            >
                                {queue && (
                                    <GraphVertexDetails graphNode={queue} isTemporalEpochView={chipId === undefined} />
                                )}
                            </Collapsible>
                        }
                    />
                ))}
            </div>
        </div>
    );
};

QueuesPropertiesTab.defaultProps = {
    chipId: undefined,
};

export default QueuesPropertiesTab;
