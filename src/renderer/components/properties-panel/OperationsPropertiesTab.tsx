import { useDispatch, useSelector } from 'react-redux';
import React, { useContext, useMemo, useState } from 'react';
import { Button, PopoverPosition } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Tooltip2 } from '@blueprintjs/popover2';

import { clearAllOperations, RootState, selectGroup } from '../../../data/store';
import DataSource from '../../../data/DataSource';
import FilterableComponent from '../FilterableComponent';
import SelectableOperation from '../SelectableOperation';
import SearchField from "../SearchField";
import GraphNodeDetails from "../GraphNodeDetails";

const OperationsPropertiesTab = (): React.ReactElement => {
    const dispatch = useDispatch();

    const { chip } = useContext(DataSource);

    const groupsSelectionState = useSelector((state: RootState) => state.nodeSelection.groups);

    const [filterQuery, setFilterQuery] = useState<string>('');

    const operationsList = useMemo(() => (chip ? [...chip.operations] : []), [chip]);

    const selectFilteredOperations = () => {
        if (!chip) {
            return;
        }
        Object.keys(groupsSelectionState).forEach((op) => {
            if (op.toLowerCase().includes(filterQuery.toLowerCase())) {
                dispatch(selectGroup({ opName: op, selected: true }));
            }
        });
    };

    const setOperationSelectionState = (opName: string, selected: boolean) =>
        dispatch(
            selectGroup({
                opName,
                selected,
            }),
        );

    return (
        <div>
            <div>
                <SearchField searchQuery={filterQuery} onQueryChanged={setFilterQuery} />
                <Tooltip2 content='Select all filtered operations' position={PopoverPosition.RIGHT}>
                    <Button icon={IconNames.CUBE_ADD} onClick={() => selectFilteredOperations()} />
                </Tooltip2>
                <Tooltip2 content='Deselect all operations' position={PopoverPosition.RIGHT}>
                    <Button icon={IconNames.CUBE_REMOVE} onClick={() => dispatch(clearAllOperations())} />
                </Tooltip2>
            </div>
            <div className='operations-wrap list-wrap'>
                <div className='scrollable-content'>
                    {operationsList.map((operation) => {
                        return (
                            <FilterableComponent
                                key={operation.name}
                                filterableString={operation.name}
                                filterQuery={filterQuery}
                                component={
                                    <>
                                        <SelectableOperation
                                            opName={operation.name}
                                            value={groupsSelectionState[operation.name]?.selected}
                                            selectFunc={setOperationSelectionState}
                                            stringFilter={filterQuery}
                                        />
                                        {operation && <GraphNodeDetails graphNode={operation} />}
                                    </>
                                }
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default OperationsPropertiesTab;
