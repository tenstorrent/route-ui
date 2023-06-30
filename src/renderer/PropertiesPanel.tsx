import React, {ChangeEvent, FC, useContext, useEffect, useState} from 'react';
import {Button, Checkbox, InputGroup, Tab, TabId, Tabs, Tooltip} from '@blueprintjs/core';
import {IconNames} from '@blueprintjs/icons';
import DataSource from '../data/DataSource';
import {ComputeNode, convertBytes, NOCLink, NOCLinkInternal, Pipe} from '../data/DataStructures';
import getPipeColor from '../data/ColorGenerator';
import HighlightedText from './components/HighlightedText';
import FilterableComponent from './components/FilterableComponent';

interface OperationItem {
    operation: string;
    nodes: ComputeNode[];
}

export default function PropertiesPanel() {
    const {svgData, setSvgData} = useContext(DataSource);

    const [selectedNodes, setSelectedNodes] = useState<ComputeNode[]>([]);
    const [pipesList, setPipesList] = useState<Pipe[]>([]);
    const [selectedPipe, setSelectedPipe] = useState<Pipe | null>(null);
    const [pipeFilter, setPipeFilter] = useState<string>('');
    const [opsFilter, setOpsFilter] = useState<string>('');

    const [operationsList, setOperationsList] = useState<OperationItem[]>([]);

    useEffect(() => {
        const selection: ComputeNode[] = svgData.nodes.filter((n) => n.selected);
        setSelectedNodes(selection);
    }, [svgData]);

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
    useEffect(() => {
        const pipes: Map<string, Pipe[]> = new Map();
        svgData.nodes.forEach((n) => {
            n.links.forEach((l) => {
                l.pipes.forEach((p) => {
                    if (!pipes.has(p.id)) {
                        pipes.set(p.id, []);
                    }
                    // @ts-ignore
                    pipes.get(p.id).push(p);
                });
            });
            n.internalLinks.forEach((l) => {
                l.pipes.forEach((p) => {
                    if (!pipes.has(p.id)) {
                        pipes.set(p.id, []);
                    }
                    // @ts-ignore
                    pipes.get(p.id).push(p);
                });
            });
        });

        let list: Pipe[] = [];
        pipes.forEach((pipe: Pipe[]) => {
            list.push(pipe[0]);
        });
        list = list.sort((a, b) => {
            if (a.id < b.id) {
                return -1;
            }
            if (a.id > b.id) {
                return 1;
            }
            return 0;
        });

        setPipesList(list);
    }, [svgData]);
    const selectPipe = (pipeId: string, val: boolean = false) => {
        svgData.nodes.forEach((n) => {
            n.links.forEach((l) => {
                l.pipes.forEach((p) => {
                    if (p.id === pipeId) {
                        l.selected = val;
                        p.selected = val;
                    }
                });
            });
            n.internalLinks.forEach((l) => {
                l.pipes.forEach((p) => {
                    if (p.id === pipeId) {
                        l.selected = val;
                        p.selected = val;
                    }
                });
            });
        });
        setSvgData({...svgData});
    };
    const selectNode = (node: ComputeNode, val: boolean) => {
        node.selected = val;
        setSvgData({...svgData});
    };

    const selectNodesByOp = (op: string, val: boolean) => {
        svgData.nodes.forEach((n) => {
            if (n.opName === op) {
                n.selected = val;
            } else {
                n.selected = false;
            }
        });
        setSvgData({...svgData});
    };
    const clearAll = () => {
        svgData.nodes.forEach((n) => {
            n.links.forEach((l) => {
                l.pipes.forEach((p) => {
                    p.selected = false;
                });
            });
            n.internalLinks.forEach((l) => {
                l.pipes.forEach((p) => {
                    p.selected = false;
                });
            });
        });
        setSvgData({...svgData});
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
                            <Button icon={IconNames.CLEAN} onClick={clearAll}>
                                Clear pipes
                            </Button>

                            {/* {selectedNodes.length ? <div>Selected compute nodes</div> : ''} */}
                            <div className="properties-panel-nodes">
                                {selectedNodes.map((node: ComputeNode) => (
                                    <div className="node-element" key={node.uid}>
                                        <h3 className={`node-type-${node.getType()}`}>
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
                                        <p className="opname">
                                            <strong>{node.opName}</strong>
                                        </p>
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
                                                                <SelectablePipe pipe={pipe} selectPipe={selectPipe} pipeFilter=""/>
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
                                                                <SelectablePipe pipe={pipe} selectPipe={selectPipe} pipeFilter=""/>
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
                                <InputGroup placeholder="Search..." value={pipeFilter} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPipeFilter(e.target.value)}/>
                            </div>
                            <div className="properties-panel__content">
                                <div className="pipelist-wrap list-wrap">
                                    <ul className="scrollable-content">
                                        {pipesList.map((pipe) => (
                                            <FilterableComponent
                                                filterableString={pipe.id}
                                                filterQuery={pipeFilter}
                                                component={
                                                    <li>
                                                        <SelectablePipe pipe={pipe} selectPipe={selectPipe} pipeFilter={pipeFilter}/>
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
                                <InputGroup placeholder="Search..." value={opsFilter} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOpsFilter(e.target.value)}/>
                            </div>
                            <div className="operations-wrap list-wrap">
                                <div className="scrollable-content">
                                    {operationsList.map((op) => (
                                        <FilterableComponent
                                            filterableString={op.operation}
                                            filterQuery={opsFilter}
                                            component={<SelectableOperation op={op} selectFunc={selectNodesByOp} stringFilter={opsFilter}/>}
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
    selectPipe: (id: string, checked: boolean) => void;
    pipeFilter: string;
}

const SelectablePipe: FC<SelectablePipeProps> = ({pipe, selectPipe, pipeFilter}) => {
    return (
        <>
            <Checkbox
                checked={pipe.selected}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    selectPipe(pipe.id, e.target.checked);
                }}
            />
            <span className="label">
                <HighlightedText text={pipe.id} filter={pipeFilter}/> {convertBytes(pipe.bandwidth)}{' '}
                <span className={`color-swatch ${pipe.selected ? '' : 'transparent'}`} style={{backgroundColor: getPipeColor(pipe.id)}}/>
            </span>
        </>
    );
};

interface SelectableOperationProps {
    op: {
        operation: string;
    };
    selectFunc: (operation: string, checked: boolean) => void;
    stringFilter: string;
}

const SelectableOperation: FC<SelectableOperationProps> = ({op, selectFunc, stringFilter}) => {
    return (
        <div className="op-element">
            <Checkbox
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    selectFunc(op.operation, e.target.checked);
                }}
            />
            <HighlightedText text={op.operation} filter={stringFilter}/>
        </div>
    );
};
