import React, {ChangeEvent, FC, useContext, useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Button, Checkbox, InputGroup, PopoverPosition, Tab, TabId, Tabs, Tooltip} from '@blueprintjs/core';
import {IconNames} from '@blueprintjs/icons';
import DataSource from '../data/DataSource';
import {ComputeNode, convertBytes, NOCLink, NOCLinkInternal, Pipe} from '../data/DataStructures';
import getPipeColor, {getGroupColor} from '../data/ColorGenerator';
import HighlightedText from './components/HighlightedText';

import FilterableComponent from './components/FilterableComponent';
import {clearAllPipes, RootState, selectGroup, selectPipeSelectionById, updateNodeSelection, updatePipeSelection} from '../data/store';

interface OperationItem {
    operation: string;
    nodes: ComputeNode[];
}

export default function PropertiesPanel() {
    const {svgData} = useContext(DataSource);

    const [selectedNodes, setSelectedNodes] = useState<ComputeNode[]>([]);
    // const [pipesList, setPipesList] = useState<Pipe[]>([]);
    const [selectedPipe, setSelectedPipe] = useState<Pipe | null>(null);
    const [pipeFilter, setPipeFilter] = useState<string>('');
    const [opsFilter, setOpsFilter] = useState<string>('');

    const [operationsList, setOperationsList] = useState<OperationItem[]>([]);
    const dispatch = useDispatch();

    const nodeSelectionState = useSelector((state: RootState) => state.nodeSelection);
    // console.log(selectedNodes)
    useEffect(() => {
        const selected = nodeSelectionState.nodeList.filter((n) => n.selected);
        const selection: ComputeNode[] = svgData.nodes.filter((node: ComputeNode) => {
            return selected.filter((n) => n.id === node.uid).length > 0;
        });

        setSelectedNodes(selection);
    }, [svgData, nodeSelectionState]);

    useEffect(() => {
        const opNames: Map<string, ComputeNode[]> = new Map<string, ComputeNode[]>();
        const opList: OperationItem[] = [];
        svgData.nodes.map((n) => {
            const {opName} = n;
            if (opName !== '') {
                if (!opNames.has(opName)) {
                    opNames.set(opName, []);
                }
                opNames.get(opName).push(n);
            }
        });
        opNames.forEach((n: ComputeNode[], op: string) => {
            opList.push({operation: op, nodes: n});
        });
        setOperationsList(opList);
    }, [svgData]);

    const getLinksForNode = (node: ComputeNode): NOCLink[] => {
        const out: NOCLink[] = [];
        node.links.forEach((l) => {
            out.push(l);
        });
        return out;
    };

    const getPipesForLink = (link: NOCLinkInternal): Pipe[] => {
        const out: Pipe[] = [];
        link.pipes.forEach((p) => {
            out.push(p);
        });
        return out;
    };

    const getInternalLinksForNode = (node: ComputeNode): NOCLinkInternal[] => {
        const out: NOCLinkInternal[] = [];
        node.internalLinks.forEach((l) => {
            out.push(l);
        });
        return out;
    };

    const selectPipe = (pipeId: string, selected: boolean = false) => {
        dispatch(updatePipeSelection({id: pipeId, selected}));
    };
    const selectNode = (node: ComputeNode, selected: boolean) => {
        console.log('selecting node', node.uid, selected);
        dispatch(updateNodeSelection({id: node.uid, selected}));
    };

    const selectNodesByOp = (opName: string, selected: boolean) => {
        dispatch(selectGroup({opName, selected}));
    };
    const clearAll = () => {
        dispatch(clearAllPipes());
    };

    const [selectedTab, setSelectedTab] = useState<TabId>('tab2');

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
                            <Button icon={IconNames.CLEAN} onClick={clearAll}>
                                Clear pipes
                            </Button>

                            {/* {selectedNodes.length ? <div>Selected compute nodes</div> : ''} */}
                            <div className="properties-panel-nodes">
                                {selectedNodes.map((node: ComputeNode) => (
                                    <div className="node-element" key={node.uid}>
                                        <h3 className={`node-type-${node.getNodeLabel()}`}>
                                            {node.type.toUpperCase()} - {node.loc.x}, {node.loc.y}
                                            <Tooltip content="Close ComputeNode">
                                                <Button
                                                    icon={IconNames.CROSS}
                                                    onClick={() => {
                                                        selectNode(node, false);
                                                    }}
                                                />
                                            </Tooltip>
                                        </h3>
                                        {node.opCycles ? <p>{node.opCycles.toLocaleString()} cycles</p> : null}
                                        {node.opName !== '' && (
                                            <div className="opname">
                                                <Tooltip
                                                    content={nodeSelectionState.groups[node.opName][0].selected ? 'Will deselect all compute nodes with this operation' : ''}
                                                    position={PopoverPosition.TOP}
                                                >
                                                    <SelectableOperation
                                                        op={{nodes: [], operation: node.opName}}
                                                        value={nodeSelectionState.groups[node.opName][0].selected}
                                                        selectFunc={selectNodesByOp}
                                                        stringFilter=""
                                                    />
                                                </Tooltip>
                                            </div>
                                        )}

                                        <div className="node-links-wrap">
                                            <h4>Internal Links</h4>

                                            {getInternalLinksForNode(node).map((link: NOCLinkInternal, index) => (
                                                <div key={index}>
                                                    <h5>
                                                        <span>
                                                            {link.id} - {convertBytes(link.totalDataBytes)} - {convertBytes(link.bpc, 2)} of {convertBytes(link.maxBandwidth)}
                                                        </span>
                                                    </h5>
                                                    <ul className="node-pipelist">
                                                        {getPipesForLink(link).map((pipe: Pipe) => (
                                                            <li key={pipe.id}>
                                                                <SelectablePipe pipe={pipe} selectPipe={selectPipe} pipeFilter="" />
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="node-links-wrap">
                                            <h4>Links</h4>
                                            {getLinksForNode(node).map((link: NOCLink, index) => (
                                                <div key={index}>
                                                    <h5 className={link.totalDataBytes === 0 ? 'inactive' : ''}>
                                                        <span>
                                                            {link.id} - {convertBytes(link.totalDataBytes)} - {convertBytes(link.bpc, 2)} of {convertBytes(link.maxBandwidth)}
                                                        </span>
                                                    </h5>
                                                    <ul className="node-pipelist">
                                                        {getPipesForLink(link).map((pipe: Pipe) => (
                                                            <li key={pipe.id}>
                                                                <SelectablePipe pipe={pipe} selectPipe={selectPipe} pipeFilter="" />
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
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
                                <Button icon={IconNames.CLEAN} onClick={clearAll}>
                                    Clear pipes
                                </Button>
                            </div>
                            <div className="search-field">
                                <InputGroup placeholder="Search..." value={pipeFilter} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPipeFilter(e.target.value)} />
                            </div>
                            <div className="properties-panel__content">
                                <div className="pipelist-wrap list-wrap">
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
                                            key={op.operation}
                                            filterableString={op.operation}
                                            filterQuery={opsFilter}
                                            component={
                                                <SelectableOperation
                                                    op={op}
                                                    value={nodeSelectionState.groups[op.operation][0].selected}
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

//
interface SelectablePipeProps {
    pipe: Pipe;
    pipeFilter: string;
}

const SelectablePipe: FC<SelectablePipeProps> = ({pipe, pipeFilter}) => {
    const dispatch = useDispatch();
    const pipeState = useSelector((state: RootState) => selectPipeSelectionById(state, pipe.id));

    // if (!pipe) {
    //     return null;
    // }

    const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
        dispatch(updatePipeSelection({id: pipeState.id, selected: e.target.checked}));
    };

    return (
        <>
            <Checkbox checked={pipeState.selected} onChange={handleCheckboxChange} />
            <span className="label">
                <HighlightedText text={pipeState.id} filter={pipeFilter} /> {convertBytes(pipe.bandwidth)}{' '}
                <span className={`color-swatch ${pipeState.selected ? '' : 'transparent'}`} style={{backgroundColor: getPipeColor(pipeState.id)}} />
            </span>
        </>
    );
};

interface SelectableOperationProps {
    op: {
        operation: string;
    };
    value: boolean;
    selectFunc: (operation: string, checked: boolean) => void;
    stringFilter: string;
}

const SelectableOperation: FC<SelectableOperationProps> = ({op, selectFunc, value, stringFilter}) => {
    return (
        <div className="op-element">
            <Checkbox
                checked={value}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    selectFunc(op.operation, e.target.checked);
                }}
            />
            <HighlightedText text={op.operation} filter={stringFilter} />
            <span className={`color-swatch ${value ? '' : 'transparent'}`} style={{backgroundColor: getGroupColor(op.operation)}} />
        </div>
    );
};
