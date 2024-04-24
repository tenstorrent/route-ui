// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent Inc.

import { Button, PopoverPosition } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Tooltip2 } from '@blueprintjs/popover2';
import { useContext, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { GraphOnChipContext } from '../../../data/GraphOnChipContext';
import { getOperandState } from '../../../data/store/selectors/nodeSelection.selectors';
import { clearAllQueues } from '../../../data/store/slices/nodeSelection.slice';
import QueueIconMinus from '../../../main/assets/QueueIconMinus';
import QueueIconPlus from '../../../main/assets/QueueIconPlus';
import useSelectableGraphVertex from '../../hooks/useSelectableGraphVertex.hook';
import Collapsible from '../Collapsible';
import FilterableComponent from '../FilterableComponent';
import GraphVertexDetails from '../GraphVertexDetails';
import SearchField from '../SearchField';
import GraphVertexDetailsSelectables from '../GraphVertexDetailsSelectables';
import { GraphVertexType } from '../../../data/GraphNames';

function QueuesPropertiesTab() {
    const dispatch = useDispatch();
    const { getActiveGraphOnChip, getActiveGraphName } = useContext(GraphOnChipContext);
    const graphOnChip = getActiveGraphOnChip();
    const graphName = getActiveGraphName();

    const [allOpen, setAllOpen] = useState(true);
    const [filterQuery, setFilterQuery] = useState<string>('');
    const operandsSelectionState = useSelector(getOperandState);
    const queuesList = useMemo(() => (graphOnChip ? [...graphOnChip.queues] : []), [graphOnChip]);

    const { selectOperand } = useSelectableGraphVertex();
    const selectFilteredQueue = () => {
        if (!graphOnChip) {
            return;
        }

        Object.entries(operandsSelectionState).forEach(([name, operand]) => {
            const isQueue = operand.type === GraphVertexType.QUEUE;
            const isSameGraph = operand.graphName === graphName;
            const isSameName = name.toLowerCase().includes(filterQuery.toLowerCase());

            if (isQueue && isSameGraph && isSameName) {
                selectOperand(name, true);
            }
        });
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
                            <Button icon={<QueueIconPlus />} onClick={() => selectFilteredQueue()} />
                        </Tooltip2>,
                        <Tooltip2
                            content='Deselect all queues for active graph'
                            position={PopoverPosition.RIGHT}
                            key='deselect-all-ops'
                        >
                            <Button icon={<QueueIconMinus />} onClick={() => dispatch(clearAllQueues(graphName))} />
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
                                contentStyles={{ color: '#000' }}
                            >
                                {queue && <GraphVertexDetails graphNode={queue} />}
                            </Collapsible>
                        }
                    />
                ))}
            </div>
        </div>
    );
}

export default QueuesPropertiesTab;
