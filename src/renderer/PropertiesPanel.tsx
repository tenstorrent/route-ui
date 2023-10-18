import React, { useContext, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Icon, InputGroup, PopoverPosition, Tab, TabId, Tabs } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Tooltip2 } from '@blueprintjs/popover2';
import DataSource from '../data/DataSource';
import Chip, { ComputeNode, Pipe } from '../data/Chip';
import FilterableComponent from './components/FilterableComponent';
import { clearAllOperations, clearAllPipes, RootState, selectGroup, updatePipeSelection } from '../data/store';
import SelectableOperation from './components/SelectableOperation';
import SelectablePipe from './components/SelectablePipe';

import { Operation } from '../data/GraphTypes';
import { filterIterable, mapIterable } from '../utils/IterableHelpers';
import { ComputeNodeState } from '../data/StateTypes';
import ComputeNodePropertiesCard from './components/ComputeNodePropertiesCard';

function OperationDetails(props: { operation: Operation }) {
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

const OperationsPropertiesTab = () => {
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
                            <Icon icon={IconNames.SEARCH} />
                        )
                    }
                    placeholder=''
                    value={opsFilter}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOpsFilter(e.target.value)}
                />
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
                                filterQuery={opsFilter}
                                component={
                                    <>
                                        <SelectableOperation
                                            opName={operation.name}
                                            value={groupsSelectionState[operation.name]?.selected}
                                            selectFunc={setOperationSelectionState}
                                            stringFilter={opsFilter}
                                        />
                                        {operation && <OperationDetails operation={operation} />}
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

const PipesPropertiesTab = () => {
    const dispatch = useDispatch();

    const { chip } = useContext(DataSource);

    const [pipeFilter, setPipeFilter] = useState<string>('');

    const selectFilteredPipes = () => {
        if (!chip) {
            return;
        }

        chip.allUniquePipes.forEach((pipe: Pipe) => {
            if (pipe.id.toLowerCase().includes(pipeFilter.toLowerCase())) {
                dispatch(updatePipeSelection({ id: pipe.id, selected: true }));
            }
        });
    };

    return (
        <div className='pipe-renderer-panel'>
            <div className='search-field'>
                <InputGroup
                    rightElement={
                        pipeFilter ? (
                            <Button
                                minimal
                                onClick={() => {
                                    setPipeFilter('');
                                }}
                                icon={IconNames.CROSS}
                            />
                        ) : (
                            <Icon icon={IconNames.SEARCH} />
                        )
                    }
                    placeholder=''
                    value={pipeFilter}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPipeFilter(e.target.value)}
                />
                <Tooltip2 content='Select all filtered pipes' position={PopoverPosition.RIGHT}>
                    <Button icon={IconNames.FILTER_LIST} onClick={() => selectFilteredPipes()} />
                </Tooltip2>
                <Tooltip2 content='Deselect all pipes' position={PopoverPosition.RIGHT}>
                    <Button icon={IconNames.FILTER_REMOVE} onClick={() => dispatch(clearAllPipes())} />
                </Tooltip2>
            </div>
            <div className='properties-panel__content'>
                <div className='pipelist-wrap list-wrap'>
                    {chip && (
                        <ul className='scrollable-content'>
                            {chip.allUniquePipes.map((pipe) => (
                                <FilterableComponent
                                    key={pipe.id}
                                    filterableString={pipe.id}
                                    filterQuery={pipeFilter}
                                    component={
                                        <li>
                                            <SelectablePipe pipe={pipe} pipeFilter={pipeFilter} />
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

function ComputeNodesPropertiesTab() {
    const { chip } = useContext(DataSource);

    const nodesSelectionState = useSelector((state: RootState) => state.nodeSelection);

    const selectedNodes: ComputeNode[] = useMemo(() => {
        if (!chip) {
            return [];
        }
        return Object.values(nodesSelectionState.nodeList)
            .filter((n) => n.selected)
            .map((nodeState) => chip.getNode(nodeState.id));
    }, [chip, nodesSelectionState]);

    return (
        <>
            {/* {selectedNodes.length ? <div>Selected compute nodes</div> : ''} */}
            <div className='properties-panel-nodes'>
                {selectedNodes.map((node: ComputeNode) => (
                    <ComputeNodePropertiesCard key={node.uid} node={node} nodesSelectionState={nodesSelectionState} />
                ))}
            </div>
        </>
    );
}

export default function PropertiesPanel() {
    const [selectedTab, setSelectedTab] = useState<TabId>('tab1');

    return (
        <div className='properties-panel'>
            <Tabs id='my-tabs' selectedTabId={selectedTab} onChange={setSelectedTab} className='properties-tabs'>
                <Tab id='tab1' title='Compute Node' panel={<ComputeNodesPropertiesTab />} />

                <Tab id='tab2' title='All pipes' panel={<PipesPropertiesTab />} />

                <Tab id='tab3' title='Operations' panel={<OperationsPropertiesTab />} />
            </Tabs>
        </div>
    );
}
