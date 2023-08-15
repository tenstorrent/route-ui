import React, {useContext, useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Button, Icon, InputGroup, PopoverPosition, Tab, TabId, Tabs, Tooltip} from '@blueprintjs/core';
import {IconNames} from '@blueprintjs/icons';
import DataSource from '../data/DataSource';
import {ComputeNode, ComputeNodeType, NOCLink} from '../data/DataStructures';

import FilterableComponent from './components/FilterableComponent';
import {openDetailedView, RootState, selectGroup, updateNodeSelection, updatePipeSelection} from '../data/store';
import SelectableOperation from './components/SelectableOperation';
import SelectablePipe from './components/SelectablePipe';
import {getInternalPipeIDsForNode, getLinksForNode, getPipeIdsForNode} from '../data/utils';
import LinkComponent from './components/LinkComponent';

export default function PropertiesPanel() {
    const {svgData} = useContext(DataSource);

    const [selectedNodes, setSelectedNodes] = useState<ComputeNode[]>([]);
    const [pipeFilter, setPipeFilter] = useState<string>('');
    const [opsFilter, setOpsFilter] = useState<string>('');

    const [operationsList, setOperationsList] = useState<string[]>([]);
    const dispatch = useDispatch();

    const nodeSelectionState = useSelector((state: RootState) => state.nodeSelection);
    const groups = useSelector((state: RootState) => state.nodeSelection.groups);
    const {isOpen, uid} = useSelector((state: RootState) => state.detailedView);

    useEffect(() => {
        const selected = nodeSelectionState.nodeList.filter((n) => n.selected);
        const selection: ComputeNode[] = svgData.nodes.filter((node: ComputeNode) => {
            return selected.filter((n) => n.id === node.uid).length > 0;
        });

        setSelectedNodes(selection);
    }, [svgData, nodeSelectionState]);

    useEffect(() => {
        const opList: string[] = [];
        Object.keys(groups).forEach((op) => {
            opList.push(op);
        });
        setOperationsList(opList);
    }, []);

    const changePipeState = (pipeList: string[], state: boolean) => {
        pipeList.forEach((pipeId) => {
            dispatch(updatePipeSelection({id: pipeId, selected: state}));
        });
    };
    const selectNode = (node: ComputeNode, selected: boolean) => {
        dispatch(updateNodeSelection({id: node.uid, selected}));
    };

    const selectNodesByOp = (opName: string, selected: boolean) => {
        dispatch(selectGroup({opName, selected}));
    };

    const [selectedTab, setSelectedTab] = useState<TabId>('tab1');

    const handleTabChange = (newTabId: TabId) => {
        setSelectedTab(newTabId);
    };

    return (
        <div className="properties-panel">
            <Tabs id="my-tabs" selectedTabId={selectedTab} onChange={handleTabChange} className="properties-tabs">
                <Tab
                    id="tab1"
                    title="Compute Node"
                    panel={
                        <>
                            {/* {selectedNodes.length ? <div>Selected compute nodes</div> : ''} */}
                            <div className="properties-panel-nodes">
                                {selectedNodes.map((node: ComputeNode) => (
                                    <div className="node-element" key={node.uid}>
                                        <h3 className={`node-type node-type-${node.getNodeLabel()} ${node.uid === uid && isOpen ? 'detailed-view' : ''}`}>
                                            {node.type.toUpperCase()} - {node.loc.x}, {node.loc.y}
                                            <Tooltip content="Close ComputeNode">
                                                <Button
                                                    small
                                                    icon={IconNames.CROSS}
                                                    onClick={() => {
                                                        selectNode(node, false);
                                                    }}
                                                />
                                            </Tooltip>
                                        </h3>
                                        {node.opCycles ? <p>{node.opCycles.toLocaleString()} cycles</p> : null}
                                        {node.type === ComputeNodeType.DRAM ? (
                                            <p>
                                                Channel {node.dramChannel}, Sub {node.dramSubchannel}
                                            </p>
                                        ) : null}
                                        {node.opName !== '' && (
                                            <div className="opname">
                                                <Tooltip content={node.opName} position={PopoverPosition.TOP}>
                                                    <SelectableOperation
                                                        opName={node.opName}
                                                        value={nodeSelectionState.groups[node.opName].selected}
                                                        selectFunc={selectNodesByOp}
                                                        stringFilter=""
                                                    />
                                                </Tooltip>
                                            </div>
                                        )}
                                        <div className="node-controls">
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

                                            <Button small icon={IconNames.FILTER_LIST} onClick={() => changePipeState(getInternalPipeIDsForNode(node), true)}>
                                                Select internal pipes
                                            </Button>
                                            <Button small icon={IconNames.FILTER_KEEP} onClick={() => changePipeState(getPipeIdsForNode(node), true)}>
                                                Select all pipes
                                            </Button>
                                            <Button small icon={IconNames.FILTER_REMOVE} onClick={() => changePipeState(getPipeIdsForNode(node), false)}>
                                                Deselect all pipes
                                            </Button>
                                        </div>

                                        <div className="node-links-wrap">
                                            <h4>Links</h4>
                                            {getLinksForNode(node).map((link: NOCLink, index) => (
                                                <LinkComponent link={link} showEmpty />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    }
                />

                <Tab
                    id="tab2"
                    title="All pipes"
                    panel={
                        <div className="pipe-renderer-panel">
                            <div className="search-field">
                                <InputGroup placeholder="Search..." value={pipeFilter} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPipeFilter(e.target.value)} />
                            </div>
                            <div className="properties-panel__content">
                                <div className="pipelist-wrap list-wrap">
                                    {svgData && (
                                        <ul className="scrollable-content">
                                            {svgData.allUniquePipes.map((pipe) => (
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
                    id="tab3"
                    title="Operations"
                    panel={
                        <div>
                            <div className="search-field">
                                <InputGroup placeholder="Search..." value={opsFilter} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOpsFilter(e.target.value)} />
                            </div>
                            <div className="operations-wrap list-wrap">
                                <div className="scrollable-content">
                                    {operationsList.map((op) => (
                                        <FilterableComponent
                                            key={op}
                                            filterableString={op}
                                            filterQuery={opsFilter}
                                            component={
                                                <SelectableOperation
                                                    opName={op}
                                                    value={nodeSelectionState.groups[op].selected}
                                                    selectFunc={selectNodesByOp}
                                                    stringFilter={opsFilter}
                                                />
                                            }
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    }
                />
            </Tabs>
        </div>
    );
}
