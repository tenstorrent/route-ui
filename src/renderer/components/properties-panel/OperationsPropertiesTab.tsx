// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent AI ULC

import { Button, PopoverPosition } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Tooltip2 } from '@blueprintjs/popover2';
import { selectOperandList } from 'data/store/slices/nodeSelection.slice';
import React, { useContext, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { GraphOnChipContext } from '../../../data/GraphOnChipContext';
import { Operation } from '../../../data/GraphTypes';
import Collapsible from '../Collapsible';
import FilterableComponent from '../FilterableComponent';
import GraphVertexDetails from '../GraphVertexDetails';
import SearchField from '../SearchField';
import GraphVertexDetailsSelectables from '../GraphVertexDetailsSelectables';

const OperationsPropertiesTab = (): React.ReactElement => {
    const dispatch = useDispatch();
    const { getActiveGraphOnChip } = useContext(GraphOnChipContext);
    const graphOnChip = getActiveGraphOnChip();

    const [filterQuery, setFilterQuery] = useState<string>('');
    const operationsList = useMemo(() => (graphOnChip ? [...graphOnChip.operations] : []), [graphOnChip]);
    const [allOpen, setAllOpen] = useState(true);

    const updateFilteredOperationSelection = (selected: boolean) => {
        if (!operationsList.length) {
            return;
        }

        const filter = filterQuery.toLowerCase();
        const operands = operationsList.reduce<string[]>((filteredOperands, { name }) => {
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
                            content='Select all filtered operations'
                            position={PopoverPosition.RIGHT}
                            key='select-all-ops'
                        >
                            <Button icon={IconNames.CUBE_ADD} onClick={() => updateFilteredOperationSelection(true)} />
                        </Tooltip2>,
                        <Tooltip2
                            content='Deselect all filtered operations'
                            position={PopoverPosition.RIGHT}
                            key='deselect-all-ops'
                        >
                            <Button
                                icon={IconNames.CUBE_REMOVE}
                                onClick={() => updateFilteredOperationSelection(false)}
                            />
                        </Tooltip2>,
                    ]}
                />
                <Button onClick={() => setAllOpen(true)} minimal rightIcon={IconNames.DOUBLE_CHEVRON_DOWN} />
                <Button onClick={() => setAllOpen(false)} minimal rightIcon={IconNames.DOUBLE_CHEVRON_UP} />
            </div>
            <div className='properties-list'>
                {operationsList.map((operation: Operation) => {
                    return (
                        <FilterableComponent
                            key={operation.name}
                            filterableString={operation.name}
                            filterQuery={filterQuery}
                            component={
                                <Collapsible
                                    label={
                                        <GraphVertexDetailsSelectables
                                            operand={operation}
                                            stringFilter={filterQuery}
                                            displayType={false}
                                        />
                                    }
                                    isOpen={allOpen}
                                >
                                    {operation && <GraphVertexDetails graphNode={operation} />}
                                </Collapsible>
                            }
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default OperationsPropertiesTab;
