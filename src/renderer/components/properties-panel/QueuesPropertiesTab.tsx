import React, { useContext, useMemo, useState } from 'react';
import { Button, PopoverPosition } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { useDispatch, useSelector } from 'react-redux';
import { Tooltip2 } from '@blueprintjs/popover2';
import DataSource from '../../../data/DataSource';
import SearchField from '../SearchField';
import FilterableComponent from '../FilterableComponent';
import GraphVertexDetails from '../GraphVertexDetails';
import Collapsible from '../Collapsible';
import SelectableOperation from '../SelectableOperation';
import { clearAllQueues } from '../../../data/store/slices/nodeSelection.slice';
import { RootState } from '../../../data/store/createStore';
import QueueIconPlus from '../../../main/assets/QueueIconPlus';
import QueueIconMinus from '../../../main/assets/QueueIconMinus';
import useSelectableGraphVertex from '../../hooks/useSelectableGraphVertex.hook';

function QueuesPropertiesTab() {
    const dispatch = useDispatch();
    const { chip } = useContext(DataSource);
    const [allOpen, setAllOpen] = useState(true);
    const [filterQuery, setFilterQuery] = useState<string>('');
    const queueSelectionState = useSelector((state: RootState) => state.nodeSelection.queues);
    const queuesList = useMemo(() => (chip ? [...chip.queues] : []), [chip]);

    const { selected, selectQueue, disabledQueue } = useSelectableGraphVertex();
    const selectFilteredQueue = () => {
        if (!chip) {
            return;
        }
        Object.keys(queueSelectionState).forEach((name) => {
            if (name.toLowerCase().includes(filterQuery.toLowerCase())) {
                selectQueue(name, true);
            }
        });
    };

    return (
        <div>
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
                    <Tooltip2 content='Deselect all queues' position={PopoverPosition.RIGHT} key='deselect-all-ops'>
                        <Button icon={<QueueIconMinus />} onClick={() => dispatch(clearAllQueues())} />
                    </Tooltip2>,
                ]}
            />
            <Button onClick={() => setAllOpen(true)} minimal rightIcon={IconNames.DOUBLE_CHEVRON_DOWN} />
            <Button onClick={() => setAllOpen(false)} minimal rightIcon={IconNames.DOUBLE_CHEVRON_UP} />
            <div className='operations-wrap list-wrap'>
                <div className='scrollable-content'>
                    {queuesList.map((queue) => (
                        <FilterableComponent
                            key={queue.name}
                            filterableString={queue.name}
                            filterQuery={filterQuery}
                            component={
                                <Collapsible
                                    key={queue.name}
                                    label={
                                        <SelectableOperation
                                            disabled={disabledQueue(queue.name)}
                                            opName={queue.name}
                                            value={selected(queue.name)}
                                            selectFunc={selectQueue}
                                            stringFilter={filterQuery}
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
        </div>
    );
}

export default QueuesPropertiesTab;
