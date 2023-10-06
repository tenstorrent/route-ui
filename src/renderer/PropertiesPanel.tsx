import React, { useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Checkbox, Icon, InputGroup, PopoverPosition, Tab, TabId, Tabs } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Tooltip2 } from '@blueprintjs/popover2';
import DataSource from '../data/DataSource';
import { ComputeNode, NOCLink, Pipe } from '../data/Chip';
import FilterableComponent from './components/FilterableComponent';
import {
    clearAllOperations,
    clearAllPipes,
    openDetailedView,
    RootState,
    selectGroup,
    updateNodeSelection,
    updatePipeSelection,
} from '../data/store';
import SelectableOperation from './components/SelectableOperation';
import SelectablePipe from './components/SelectablePipe';
import LinkDetails from './components/LinkDetails';
import { CoreOperation } from '../data/ChipAugmentation';

import { ComputeNodeType } from '../data/Types';
import { OpGraphNodeType } from '../data/GraphTypes';

export default function PropertiesPanel() {
    const { chip } = useContext(DataSource);

    const [selectedNodes, setSelectedNodes] = useState<ComputeNode[]>([]);
    const [pipeFilter, setPipeFilter] = useState<string>('');
    const [opsFilter, setOpsFilter] = useState<string>('');

    const [operationsList, setOperationsList] = useState<string[]>([]);
    const dispatch = useDispatch();

    const nodeSelectionState = useSelector((state: RootState) => state.nodeSelection);
    const groups = useSelector((state: RootState) => state.nodeSelection.groups);
    const { isOpen, uid } = useSelector((state: RootState) => state.detailedView);

    useEffect(() => {
        if (!chip) {
            return;
        }

        const selected = Object.values(nodeSelectionState.nodeList).filter((n) => n.selected);

        const selection: ComputeNode[] = chip.nodes.filter((node: ComputeNode) => {
            return selected.filter((n) => n.id === node.uid).length > 0;
        });

        setSelectedNodes(selection);
    }, [chip, nodeSelectionState]);

    useEffect(() => {
        const opList: string[] = [];
        Object.keys(groups).forEach((op) => {
            opList.push(op);
        });
        setOperationsList(opList);
    }, [groups]);

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
    const selectFilteredOperations = () => {
        if (!chip) {
            return;
        }
        Object.keys(groups).forEach((op) => {
            if (op.toLowerCase().includes(opsFilter.toLowerCase())) {
                dispatch(selectGroup({ opName: op, selected: true }));
            }
        });
    };

    const changePipeState = (pipeList: string[], state: boolean) => {
        pipeList.forEach((pipeId) => {
            dispatch(updatePipeSelection({ id: pipeId, selected: state }));
        });
    };
    const selectNode = (node: ComputeNode, selected: boolean) => {
        dispatch(updateNodeSelection({ id: node.uid, selected }));
    };

    const selectOperationGroup = (opName: string, selected: boolean) => {
        dispatch(selectGroup({ opName, selected }));
    };

    const [selectedTab, setSelectedTab] = useState<TabId>('tab1');

    const handleTabChange = (newTabId: TabId) => {
        setSelectedTab(newTabId);
    };

    return (
        <div className='properties-panel'>
            <Tabs id='my-tabs' selectedTabId={selectedTab} onChange={handleTabChange} className='properties-tabs'>
                <Tab
                    id='tab1'
                    title='Compute Node'
                    panel={
                        <>
                            {/* {selectedNodes.length ? <div>Selected compute nodes</div> : ''} */}
                            <div className='properties-panel-nodes'>
                                {selectedNodes.map((node: ComputeNode) => {
                                    const coreData = chip?.cores.find(
                                        (core: CoreOperation) => core.coreID === node.uid,
                                    );
                                    return (
                                        <div className='node-element' key={node.uid}>
                                            <h3
                                                className={`node-type node-type-${node.getNodeLabel()} ${
                                                    node.uid === uid && isOpen ? 'detailed-view' : ''
                                                }`}
                                            >
                                                {node.type.toUpperCase()} - {node.loc.x}, {node.loc.y}
                                                <Tooltip2 content='Close ComputeNode'>
                                                    <Button
                                                        small
                                                        icon={IconNames.CROSS}
                                                        onClick={() => {
                                                            selectNode(node, false);
                                                        }}
                                                    />
                                                </Tooltip2>
                                            </h3>
                                            {node.opCycles ? <p>{node.opCycles.toLocaleString()} cycles</p> : null}
                                            {node.type === ComputeNodeType.DRAM ? (
                                                <p>
                                                    Channel {node.dramChannel}, Sub {node.dramSubchannel}
                                                </p>
                                            ) : null}
                                            {node.opName !== '' && (
                                                <div className='opname'>
                                                    <Tooltip2 content={node.opName} position={PopoverPosition.LEFT}>
                                                        <SelectableOperation
                                                            opName={node.opName}
                                                            value={nodeSelectionState.groups[node.opName].selected}
                                                            selectFunc={selectOperationGroup}
                                                            stringFilter=''
                                                        />
                                                    </Tooltip2>
                                                </div>
                                            )}
                                            <div className='opname'>
                                                {coreData?.inputs.length && <h4 className='io-label'>Inputs:</h4>}
                                                {coreData?.inputs.map((io) => (
                                                    <ul className='scrollable-content'>
                                                        <Tooltip2 content={io.name} position={PopoverPosition.TOP}>
                                                            <div key={io.name} style={{ fontSize: '12px' }}>
                                                                {io.type === OpGraphNodeType.OPERATION ? (
                                                                    <SelectableOperation
                                                                        opName={io.name}
                                                                        value={
                                                                            nodeSelectionState.groups[io.name]?.selected
                                                                        }
                                                                        selectFunc={selectOperationGroup}
                                                                        stringFilter=''
                                                                    />
                                                                ) : (
                                                                    <div className='op-element'>
                                                                        <Checkbox checked={false} disabled />
                                                                        <span>{io.name}</span>
                                                                    </div>
                                                                )}
                                                                <ul className='scrollable-content'>
                                                                    {io.getPipeIdsForCore(coreData.coreID).map((pipeId) => (
                                                                        <li>
                                                                            <SelectablePipe
                                                                                pipe={new Pipe(pipeId, 0)}
                                                                                pipeFilter=''
                                                                            />
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        </Tooltip2>
                                                    </ul>
                                                ))}
                                                {coreData?.outputs.length && <h4 className='io-label'>Outputs:</h4>}
                                                {coreData?.outputs.map((io) => (
                                                    <ul className='scrollable-content'>
                                                        <Tooltip2 content={io.name} position={PopoverPosition.TOP}>
                                                            <div key={io.name} style={{ fontSize: '12px' }}>
                                                                {io.type === OpGraphNodeType.OPERATION ? (
                                                                    <SelectableOperation
                                                                        opName={io.name}
                                                                        value={
                                                                            nodeSelectionState.groups[io.name]?.selected
                                                                        }
                                                                        selectFunc={selectOperationGroup}
                                                                        stringFilter=''
                                                                    />
                                                                ) : (
                                                                    <div className='op-element'>
                                                                        <Checkbox checked={false} disabled />
                                                                        <span>{io.name}</span>
                                                                    </div>
                                                                )}
                                                                <ul className='scrollable-content'>
                                                                    {io.getPipeIdsForCore(coreData.coreID).map((pipeId) => (
                                                                        <li>
                                                                            <SelectablePipe
                                                                                pipe={new Pipe(pipeId, 0)}
                                                                                pipeFilter=''
                                                                            />
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        </Tooltip2>
                                                    </ul>
                                                ))}
                                            </div>
                                            <div className='node-controls'>
                                                {node.type === ComputeNodeType.DRAM && (
                                                    <Button
                                                        small
                                                        icon={IconNames.PROPERTIES}
                                                        disabled={node.uid === uid && isOpen}
                                                        onClick={() => dispatch(openDetailedView(node.uid))}
                                                    >
                                                        Detailed View
                                                    </Button>
                                                )}

                                                <Button
                                                    small
                                                    icon={IconNames.FILTER_LIST}
                                                    onClick={() =>
                                                        changePipeState(node.getInternalPipeIDsForNode(), true)
                                                    }
                                                >
                                                    Select internal pipes
                                                </Button>
                                                <Button
                                                    small
                                                    icon={IconNames.FILTER_KEEP}
                                                    onClick={() => changePipeState(node.getPipeIdsForNode(), true)}
                                                >
                                                    Select all pipes
                                                </Button>
                                                <Button
                                                    small
                                                    icon={IconNames.FILTER_REMOVE}
                                                    onClick={() => changePipeState(node.getPipeIdsForNode(), false)}
                                                >
                                                    Deselect all pipes
                                                </Button>
                                            </div>

                                            <div className='node-links-wrap'>
                                                <h4>Links</h4>
                                                {node.getLinksForNode().map((link: NOCLink) => (
                                                    <LinkDetails key={link.name} link={link} showEmpty />
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    }
                />

                <Tab
                    id='tab2'
                    title='All pipes'
                    panel={
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
                    }
                />

                <Tab
                    id='tab3'
                    title='Operations'
                    panel={
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
                                    <Button
                                        icon={IconNames.CUBE_REMOVE}
                                        onClick={() => dispatch(clearAllOperations())}
                                    />
                                </Tooltip2>
                            </div>
                            <div className='operations-wrap list-wrap'>
                                <div className='scrollable-content'>
                                    {operationsList.map((operationName) => {
                                        const operation = chip?.getOperation(operationName);

                                        return (
                                            <FilterableComponent
                                                key={operationName}
                                                filterableString={operationName}
                                                filterQuery={opsFilter}
                                                component={
                                                    <>
                                                        <SelectableOperation
                                                            opName={operationName}
                                                            value={nodeSelectionState.groups[operationName].selected}
                                                            selectFunc={selectOperationGroup}
                                                            stringFilter={opsFilter}
                                                        />
                                                        {operation && (
                                                            <div
                                                                className='operation-details'
                                                                style={{ color: '#000', marginLeft: '20px' }}
                                                            >
                                                                {operation.inputs.length > 0 && (
                                                                    <h5 className='io-label'>Inputs:</h5>
                                                                )}
                                                                {operation.inputs.map((io) => (
                                                                    <div className='operation-input' key={io.name}>
                                                                        <p>{io.name}</p>
                                                                    </div>
                                                                ))}
                                                                {operation.outputs.length > 0 && (
                                                                    <h5 className='io-label'>Outputs:</h5>
                                                                )}
                                                                {operation.outputs.map((io) => (
                                                                    <div className='operation-input' key={io.name}>
                                                                        <p>{io.name}</p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </>
                                                }
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    }
                />
            </Tabs>
        </div>
    );
}
