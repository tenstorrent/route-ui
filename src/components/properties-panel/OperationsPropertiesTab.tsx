// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent AI ULC

import { Button, PopoverPosition, Tooltip } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { selectOperandList } from '../../data/store/slices/nodeSelection.slice';
import { useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import Collapsible from '../Collapsible';
import FilterableComponent from '../FilterableComponent';
import GraphVertexDetails from '../GraphVertexDetails';
import SearchField from '../SearchField';
import GraphVertexDetailsSelectable from '../GraphVertexDetailsSelectable';
import type GraphOnChip from '../../data/GraphOnChip';
import type { GraphRelationship } from '../../data/StateTypes';
import type { BuildableOperation } from '../../data/Graph';

const OperationsPropertiesTab = ({ graphs }: { graphs: { graphOnChip: GraphOnChip; graph: GraphRelationship }[] }) => {
    const dispatch = useDispatch();

    const [filterQuery, setFilterQuery] = useState<string>('');
    const operationsList = useMemo(
        () => [
            ...graphs
                .reduce((opMap, { graphOnChip }) => {
                    [...graphOnChip.operations].forEach((op) => {
                        if (!opMap.has(op.name)) {
                            opMap.set(op.name, op);
                        }
                    });

                    return opMap;
                }, new Map<string, BuildableOperation>())
                .values(),
        ],
        [graphs],
    );
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
                        <Tooltip
                            content='Select all filtered operations'
                            position={PopoverPosition.RIGHT}
                            key='select-all-ops'
                        >
                            <Button icon={IconNames.CUBE_ADD} onClick={() => updateFilteredOperationSelection(true)} />
                        </Tooltip>,
                        <Tooltip
                            content='Deselect all filtered operations'
                            position={PopoverPosition.RIGHT}
                            key='deselect-all-ops'
                        >
                            <Button
                                icon={IconNames.CUBE_REMOVE}
                                onClick={() => updateFilteredOperationSelection(false)}
                            />
                        </Tooltip>,
                    ]}
                />
                <Button onClick={() => setAllOpen(true)} minimal rightIcon={IconNames.DOUBLE_CHEVRON_DOWN} />
                <Button onClick={() => setAllOpen(false)} minimal rightIcon={IconNames.DOUBLE_CHEVRON_UP} />
            </div>
            <div className='properties-list'>
                {operationsList.map((operation, index) => {
                    return (
                        <FilterableComponent
                            // eslint-disable-next-line react/no-array-index-key
                            key={`${index}-${operation.name}`}
                            filterableString={operation.name}
                            filterQuery={filterQuery}
                            component={
                                <Collapsible
                                    label={
                                        <GraphVertexDetailsSelectable
                                            operand={operation}
                                            stringFilter={filterQuery}
                                            showType={false}
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
