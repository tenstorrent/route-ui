import { Button, PopoverPosition } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Tooltip2 } from '@blueprintjs/popover2';
import { RootState } from 'data/store/createStore';
import { clearAllOperations } from 'data/store/slices/nodeSelection.slice';
import React, { useContext, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ChipContext } from '../../../data/ChipDataProvider';
import { Operation } from '../../../data/GraphTypes';
import useSelectableGraphVertex from '../../hooks/useSelectableGraphVertex.hook';
import Collapsible from '../Collapsible';
import FilterableComponent from '../FilterableComponent';
import GraphVertexDetails from '../GraphVertexDetails';
import SearchField from '../SearchField';
import SelectableOperation from '../SelectableOperation';

const OperationsPropertiesTab = (): React.ReactElement => {
    const dispatch = useDispatch();
    const chip = useContext(ChipContext).getActiveChip();

    const groupsSelectionState = useSelector((state: RootState) => state.nodeSelection.operations);
    const [filterQuery, setFilterQuery] = useState<string>('');
    const operationsList = useMemo(() => (chip ? [...chip.operations] : []), [chip]);
    const [allOpen, setAllOpen] = useState(true);

    const { selected, selectOperation } = useSelectableGraphVertex();
    const selectFilteredOperations = () => {
        if (!chip) {
            return;
        }
        Object.keys(groupsSelectionState).forEach((op) => {
            if (op.toLowerCase().includes(filterQuery.toLowerCase())) {
                selectOperation(op, true);
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
                            content='Select all filtered operations'
                            position={PopoverPosition.RIGHT}
                            key='select-all-ops'
                        >
                            <Button icon={IconNames.CUBE_ADD} onClick={() => selectFilteredOperations()} />
                        </Tooltip2>,
                        <Tooltip2
                            content='Deselect all operations'
                            position={PopoverPosition.RIGHT}
                            key='deselect-all-ops'
                        >
                            <Button icon={IconNames.CUBE_REMOVE} onClick={() => dispatch(clearAllOperations())} />
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
                                        <SelectableOperation
                                            disabled={operation.isOffchip}
                                            opName={operation.name}
                                            value={selected(operation.name)}
                                            selectFunc={selectOperation}
                                            stringFilter={filterQuery}
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
