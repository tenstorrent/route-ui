// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent Inc.

import { Button, PopoverPosition } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Tooltip2 } from '@blueprintjs/popover2';
import { clearAllPipes, updatePipeSelection } from 'data/store/slices/pipeSelection.slice';
import { useContext, useState } from 'react';
import { useDispatch } from 'react-redux';
import { PipeSegment } from '../../../data/GraphOnChip';
import { GraphOnChipContext } from '../../../data/GraphOnChipContext';
import FilterableComponent from '../FilterableComponent';
import SearchField from '../SearchField';
import SelectablePipe from '../SelectablePipe';

const PipesPropertiesTab = ({ chipId, epoch }: { chipId: number; epoch: number }) => {
    const dispatch = useDispatch();
    const graphOnChip = useContext(GraphOnChipContext).getGraphOnChip(epoch, chipId);

    const [pipeFilter, setPipeFilter] = useState<string>('');

    const selectFilteredPipes = () => {
        if (!graphOnChip) {
            return;
        }

        graphOnChip.allUniquePipes.forEach((pipeSegment: PipeSegment) => {
            if (pipeSegment.id.toLowerCase().includes(pipeFilter.toLowerCase())) {
                dispatch(updatePipeSelection({ id: pipeSegment.id, selected: true }));
            }
        });
    };

    return (
        <div className='properties-container'>
            <div className='properties-filter'>
                <SearchField
                    searchQuery={pipeFilter}
                    onQueryChanged={setPipeFilter}
                    controls={[
                        <Tooltip2
                            content='Select all filtered pipes'
                            position={PopoverPosition.RIGHT}
                            key='select-all-pipes'
                        >
                            <Button icon={IconNames.FILTER_LIST} onClick={() => selectFilteredPipes()} />
                        </Tooltip2>,
                        <Tooltip2
                            content='Deselect all pipes'
                            position={PopoverPosition.RIGHT}
                            key='deselect-all-pipes'
                        >
                            <Button icon={IconNames.FILTER_REMOVE} onClick={() => dispatch(clearAllPipes())} />
                        </Tooltip2>,
                    ]}
                />
            </div>
            <div className='properties-list'>
                {graphOnChip && (
                    <ul className='pipes-list'>
                        {graphOnChip.allUniquePipes.map((pipeSegment) => (
                            <FilterableComponent
                                key={pipeSegment.id}
                                filterableString={pipeSegment.id}
                                filterQuery={pipeFilter}
                                component={
                                    <li>
                                        <SelectablePipe
                                            pipeSegment={pipeSegment}
                                            pipeFilter={pipeFilter}
                                            showBandwidth={false}
                                        />
                                    </li>
                                }
                            />
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default PipesPropertiesTab;
