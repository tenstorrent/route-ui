// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent AI ULC

import { Button, PopoverPosition, Tooltip } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { selectOperandList } from '../../data/store/slices/nodeSelection.slice';
import QueueIconMinus from '../../assets/QueueIconMinus';
import QueueIconPlus from '../../assets/QueueIconPlus';
import Collapsible from '../Collapsible';
import FilterableComponent from '../FilterableComponent';
import GraphVertexDetails from '../GraphVertexDetails';
import SearchField from '../SearchField';
import GraphVertexDetailsSelectable from '../GraphVertexDetailsSelectable';
import type GraphOnChip from '../../data/GraphOnChip';
import type { GraphRelationship } from '../../data/StateTypes';
import type { Queue } from '../../data/GraphTypes';
import { QueueLocation } from '../../data/Types';

const QueuesPropertiesTab = ({ graphs }: { graphs: { graphOnChip: GraphOnChip; graph: GraphRelationship }[] }) => {
    const dispatch = useDispatch();
    const [allOpen, setAllOpen] = useState(true);
    const [filterQuery, setFilterQuery] = useState<string>('');
    const queuesList = useMemo(
        () => [
            ...graphs
                .reduce((queueMap, { graphOnChip }) => {
                    [...graphOnChip.queues].forEach((queue) => {
                        if (!queueMap.has(queue.name)) {
                            queueMap.set(queue.name, queue);
                        }
                    });

                    return queueMap;
                }, new Map<string, Queue>())
                .values(),
        ],
        [graphs],
    );

    const updateFilteredQueueSelection = (selected: boolean) => {
        if (!queuesList.length) {
            return;
        }

        const filter = filterQuery.toLowerCase();
        const operands = queuesList.reduce<string[]>((filteredOperands, { name }) => {
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
                        <Tooltip
                            content='Select all filtered queues'
                            position={PopoverPosition.RIGHT}
                            key='select-all-ops'
                        >
                            <Button icon={<QueueIconPlus />} onClick={() => updateFilteredQueueSelection(true)} />
                        </Tooltip>,
                        <Tooltip
                            content='Deselect all filtered queues'
                            position={PopoverPosition.RIGHT}
                            key='deselect-all-ops'
                        >
                            <Button icon={<QueueIconMinus />} onClick={() => updateFilteredQueueSelection(false)} />
                        </Tooltip>,
                    ]}
                />
                <Button onClick={() => setAllOpen(true)} minimal rightIcon={IconNames.DOUBLE_CHEVRON_DOWN} />
                <Button onClick={() => setAllOpen(false)} minimal rightIcon={IconNames.DOUBLE_CHEVRON_UP} />
            </div>

            <div className='properties-list'>
                {queuesList.map((queue, index) => (
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
                                    <GraphVertexDetailsSelectable
                                        operand={queue}
                                        stringFilter={filterQuery}
                                        showType={false}
                                        disabled={queue.details?.processedLocation === QueueLocation.HOST}
                                    />
                                }
                                isOpen={allOpen}
                            >
                                {queue && <GraphVertexDetails graphNode={queue} />}
                            </Collapsible>
                        }
                    />
                ))}
            </div>
        </div>
    );
};

export default QueuesPropertiesTab;
