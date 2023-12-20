import { useDispatch, useSelector } from 'react-redux';
import React, { useContext, useMemo, useState } from 'react';
import { Button, PopoverPosition } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Tooltip2 } from '@blueprintjs/popover2';
import { selectGroup, clearAllOperations } from 'data/store/slices/nodeSelection.slice';
import { RootState } from 'data/store/createStore';

import DataSource from '../../../data/DataSource';
import FilterableComponent from '../FilterableComponent';
import SelectableOperation from '../SelectableOperation';
import SearchField from '../SearchField';
import GraphVertexDetails from '../GraphVertexDetails';
import Collapsible from '../Collapsible';
import SelectablePipe from '../SelectablePipe';
import { PipeSegment } from '../../../data/Chip';
import { NOCLinkName } from '../../../data/Types';
import { Operation } from '../../../data/GraphTypes';

const OperationsPropertiesTab = (): React.ReactElement => {
    const dispatch = useDispatch();

    const { chip } = useContext(DataSource);
    const groupsSelectionState = useSelector((state: RootState) => state.nodeSelection.groups);
    const [filterQuery, setFilterQuery] = useState<string>('');
    const operationsList = useMemo(() => (chip ? [...chip.operations] : []), [chip]);
    const [allOpen, setAllOpen] = useState(true);

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
            <div className='operations-wrap list-wrap'>
                <div className='scrollable-content'>
                    {operationsList.map((operation:Operation) => {
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
                                                value={groupsSelectionState[operation.name]?.selected}
                                                selectFunc={setOperationSelectionState}
                                                stringFilter={filterQuery}
                                            />
                                        }
                                        isOpen={allOpen}
                                    >
                                        <>
                                            {operation.uniquePipeIds.length > 0 && (
                                                <Collapsible
                                                    label={<h5>pipes:</h5>}
                                                    isOpen={false}
                                                    styles={{ marginLeft: '20px' }}
                                                >
                                                    <ul className='scrollable-content'>
                                                        {operation.uniquePipeIds.map((pipeId) => (
                                                            <li>
                                                                <SelectablePipe
                                                                    pipeSegment={
                                                                        new PipeSegment(pipeId, 0, NOCLinkName.NONE)
                                                                    }
                                                                    showBandwidth={false}
                                                                    pipeFilter=''
                                                                />
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </Collapsible>
                                            )}
                                            {operation && <GraphVertexDetails graphNode={operation} />}
                                        </>
                                    </Collapsible>
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
