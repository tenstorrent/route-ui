// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent Inc.

import { Button, PopoverPosition } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Tooltip2 } from '@blueprintjs/popover2';
import { clearAllPipes, updateMultiplePipeSelection } from 'data/store/slices/pipeSelection.slice';
import { useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import GraphOnChip, { type PipeSegment } from '../../../data/GraphOnChip';
import FilterableComponent from '../FilterableComponent';
import SearchField from '../SearchField';
import SelectablePipe from '../SelectablePipe';
import type { GraphRelationship } from '../../../data/StateTypes';

const PipesPropertiesTab = ({ graphs }: { graphs: { graphOnChip: GraphOnChip; graph: GraphRelationship }[] }) => {
    const dispatch = useDispatch();
    const [pipeFilter, setPipeFilter] = useState<string>('');
    const pipeSegments = useMemo(() => {
        const uniquePipeSegments = new Map<string, PipeSegment>();

        graphs.forEach(({ graphOnChip }) =>
            graphOnChip.allUniquePipes.forEach((pipeSegment) => {
                if (!uniquePipeSegments.has(pipeSegment.id)) {
                    uniquePipeSegments.set(pipeSegment.id, pipeSegment);
                }
            }),
        );

        return [...uniquePipeSegments.values()];
    }, [graphs]);

    const selectFilteredPipes = () => {
        const pipeIdsToSelect: string[] = [];

        pipeSegments.forEach((pipeSegment) => {
            if (pipeSegment.id.toLowerCase().includes(pipeFilter.toLowerCase())) {
                pipeIdsToSelect.push(pipeSegment.id);
            }
        });

        dispatch(updateMultiplePipeSelection({ ids: pipeIdsToSelect, selected: true }));
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
                <ul className='pipes-list'>
                    {pipeSegments.map((pipeSegment, index) => (
                        <FilterableComponent
                            // eslint-disable-next-line react/no-array-index-key
                            key={`${index}-${pipeSegment.id}`}
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
            </div>
        </div>
    );
};

export default PipesPropertiesTab;
