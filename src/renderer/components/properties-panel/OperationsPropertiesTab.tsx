import { useDispatch, useSelector } from 'react-redux';
import React, { useContext, useMemo, useState } from 'react';
import { Button, Icon, InputGroup, PopoverPosition } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Tooltip2 } from '@blueprintjs/popover2';

import { clearAllOperations, RootState, selectGroup } from '../../../data/store';
import DataSource from '../../../data/DataSource';
import FilterableComponent from '../FilterableComponent';
import SelectableOperation from '../SelectableOperation';
import { Operation } from '../../../data/GraphTypes';

const OperationDetails = (props: { operation: Operation }): React.ReactElement => {
    const { operation } = props;
    const inputs = [...operation.inputs];
    const outputs = [...operation.outputs];

    return (
        <div className='operation-details' style={{ color: '#000', marginLeft: '20px' }}>
            {inputs.length > 0 && <h5 className='io-label'>Inputs:</h5>}
            {inputs.map((io) => (
                <div className='operation-input' key={io.name}>
                    <p>{io.name}</p>
                </div>
            ))}
            {outputs.length > 0 && <h5 className='io-label'>Outputs:</h5>}
            {outputs.map((io) => (
                <div className='operation-input' key={io.name}>
                    <p>{io.name}</p>
                </div>
            ))}
        </div>
    );
}

const OperationsPropertiesTab = (): React.ReactElement => {
    const dispatch = useDispatch();

    const { chip } = useContext(DataSource);

    const groupsSelectionState = useSelector((state: RootState) => state.nodeSelection.groups);

    const [opsFilter, setOpsFilter] = useState<string>('');

    const operationsList = useMemo(() => (chip ? [...chip.operations] : []), [chip]);

    const selectFilteredOperations = () => {
        if (!chip) {
            return;
        }
        Object.keys(groupsSelectionState).forEach((op) => {
            if (op.toLowerCase().includes(opsFilter.toLowerCase())) {
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
            <div className='search-field'>
                <InputGroup
                    rightElement={
                        opsFilter ? (
                            <Button
                                minimal
                                onClick={() => {
                                    setOpsFilter('');
                                }}
                                icon={IconNames.CROSS}
                            />
                        ) : (
                            <Icon icon={IconNames.SEARCH}/>
                        )
                    }
                    placeholder=''
                    value={opsFilter}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOpsFilter(e.target.value)}
                />
                <Tooltip2 content='Select all filtered operations' position={PopoverPosition.RIGHT}>
                    <Button icon={IconNames.CUBE_ADD} onClick={() => selectFilteredOperations()}/>
                </Tooltip2>
                <Tooltip2 content='Deselect all operations' position={PopoverPosition.RIGHT}>
                    <Button icon={IconNames.CUBE_REMOVE} onClick={() => dispatch(clearAllOperations())}/>
                </Tooltip2>
            </div>
            <div className='operations-wrap list-wrap'>
                <div className='scrollable-content'>
                    {operationsList.map((operation) => {
                        return (
                            <FilterableComponent
                                key={operation.name}
                                filterableString={operation.name}
                                filterQuery={opsFilter}
                                component={
                                    <>
                                        <SelectableOperation
                                            opName={operation.name}
                                            value={groupsSelectionState[operation.name]?.selected}
                                            selectFunc={setOperationSelectionState}
                                            stringFilter={opsFilter}
                                        />
                                        {operation && <OperationDetails operation={operation}/>}
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
