import { useDispatch } from 'react-redux';
import React, { useContext, useState } from 'react';
import { Button, PopoverPosition } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Tooltip2 } from '@blueprintjs/popover2';

import DataSource from '../../../data/DataSource';
import { PipeSegment } from '../../../data/Chip';
import { clearAllPipes, updatePipeSelection } from '../../../data/store';
import FilterableComponent from '../FilterableComponent';
import SelectablePipe from '../SelectablePipe';
import SearchField from '../SearchField';

const PipesPropertiesTab = () => {
    const dispatch = useDispatch();

    const { chip } = useContext(DataSource);

    const [pipeFilter, setPipeFilter] = useState<string>('');

    const selectFilteredPipes = () => {
        if (!chip) {
            return;
        }

        chip.allUniquePipes.forEach((pipeSegment: PipeSegment) => {
            if (pipeSegment.id.toLowerCase().includes(pipeFilter.toLowerCase())) {
                dispatch(updatePipeSelection({ id: pipeSegment.id, selected: true }));
            }
        });
    };

    return (
        <div className='pipe-renderer-panel'>
            <SearchField
                searchQuery={pipeFilter}
                onQueryChanged={setPipeFilter}
                controls={[
                    <Tooltip2 content='Select all filtered pipes' position={PopoverPosition.RIGHT}>
                        <Button icon={IconNames.FILTER_LIST} onClick={() => selectFilteredPipes()} />
                    </Tooltip2>,
                    <Tooltip2 content='Deselect all pipes' position={PopoverPosition.RIGHT}>
                        <Button icon={IconNames.FILTER_REMOVE} onClick={() => dispatch(clearAllPipes())} />
                    </Tooltip2>,
                ]}
            />
            <div className='properties-panel__content'>
                <div className='pipelist-wrap list-wrap'>
                    {chip && (
                        <ul className='scrollable-content'>
                            {chip.allUniquePipes.map((pipeSegment) => (
                                <FilterableComponent
                                    key={pipeSegment.id}
                                    filterableString={pipeSegment.id}
                                    filterQuery={pipeFilter}
                                    component={
                                        <li>
                                            <SelectablePipe pipeSegment={pipeSegment} pipeFilter={pipeFilter} />
                                        </li>
                                    }
                                />
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PipesPropertiesTab;
