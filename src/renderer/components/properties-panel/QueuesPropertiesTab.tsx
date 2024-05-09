// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent Inc.

import { Button, PopoverPosition } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Tooltip2 } from '@blueprintjs/popover2';
import { useContext, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { GraphOnChipContext } from '../../../data/GraphOnChipContext';
import { selectOperandList } from '../../../data/store/slices/nodeSelection.slice';
import QueueIconMinus from '../../../main/assets/QueueIconMinus';
import QueueIconPlus from '../../../main/assets/QueueIconPlus';
import Collapsible from '../Collapsible';
import FilterableComponent from '../FilterableComponent';
import GraphVertexDetails from '../GraphVertexDetails';
import SearchField from '../SearchField';
import GraphVertexDetailsSelectables from '../GraphVertexDetailsSelectables';

const QueuesPropertiesTab = ({ chipId, epoch }: { chipId: number; epoch: number }) => {
    const dispatch = useDispatch();
    const { getGraphOnChip } = useContext(GraphOnChipContext);
    const graphOnChip = getGraphOnChip(epoch, chipId);

    const [allOpen, setAllOpen] = useState(true);
    const [filterQuery, setFilterQuery] = useState<string>('');
    const queuesList = useMemo(() => (graphOnChip ? [...graphOnChip.queues] : []), [graphOnChip]);

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
                {queuesList.map((queue) => (
                    <FilterableComponent
                        key={queue.name}
                        filterableString={queue.name}
                        filterQuery={filterQuery}
                        component={
                            <Collapsible
                                key={queue.name}
                                label={
                                    <GraphVertexDetailsSelectables
                                        operand={queue}
                                        stringFilter={filterQuery}
                                        displayType={false}
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
