import {useContext, useEffect, useState} from 'react';
import {Button, Tab, TabId, Tabs} from '@blueprintjs/core';
import {IconNames} from '@blueprintjs/icons';
import DataSource from '../data/DataSource';
import {ComputeNode, convertBytes, NOCLink, NOCLinkInternal, Pipe} from '../data/DataStructures';

export default function PropertiesPanel() {
    const {svgData, setSvgData} = useContext(DataSource);
    const [html, setHtml] = useState(null);

    const [selectedNodes, setSelectedNodes] = useState<ComputeNode[]>([]);

    useEffect(() => {
        const selection: ComputeNode[] = svgData.nodes.filter((n) => n.selected);
        setSelectedNodes(selection);
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

    const getPipesForNode = (node: ComputeNode): Pipe[] => {
        const out: Pipe[] = [];
        node.links.forEach((l) => {
            l.pipes.forEach((p) => {
                out.push(p);
            });
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
                    pipes.get(p.id).push(p);
                });
            });
        });

        const out: JSX.Element[] = [];
        pipes.forEach((pipe: Pipe[], key: string) => {
            out.push(
                <p
                    key={key}
                    // className={pipe[0].selected ? 'selected' : ''}
                >
                    <input
                        type="checkbox"
                        checked={pipe[0].selected}
                        onChange={(e) => {
                            // console.log(pipe)
                            selectLinksByPipe(key, e.target.checked);
                        }}
                    />
                    {key}
                </p>
            );

            // console.log(key, pipe);
        });

        setHtml(out);

        // selectLinks('100115900000', true)
    }, [svgData]);
    const selectLinksByPipe = (pipeId: string, val: boolean = false) => {
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
    const selectLink = (node: ComputeNode, linkId: string, val: boolean = false) => {
        svgData.nodes.forEach((n) => {
            if (n === node) {
                n.links.forEach((l) => {
                    if (l.id === linkId) {
                        l.selected = val;
                    }
                });
                n.internalLinks.forEach((l) => {
                    if (l.id === linkId) {
                        l.selected = val;
                    }
                });
            }
        });
        setSvgData({...svgData});
    };
    const clearAll = () => {
        svgData.nodes.forEach((n) => {
            n.links.forEach((l) => {
                l.selected = false;
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
            <Tabs id="my-tabs" selectedTabId={selectedTab} onChange={handleTabChange}>
                <Tab
                    id="tab1"
                    title="ComputeNode properties"
                    panel={
                        <>
                            <Button icon={IconNames.CLEAN} onClick={clearAll}>
                                Clear pipes
                            </Button>

                            {selectedNodes.length ? <div>Selected compute nodes</div> : ''}
                            <div className="properties-panel-nodes">
                                {selectedNodes.map((node: ComputeNode, index) => (
                                    <div className="node-element" key={index}>
                                        <h3 className={`node-type-${node.getType()}`}>
                                            {node.type.toUpperCase()} - {node.loc.y}, {node.loc.x}
                                        </h3>
                                        <p>{node.opCycles} cycles</p>
                                        <p>
                                            <strong>{node.opName}</strong>
                                        </p>
                                        <div className="node-links-wrap">
                                            <h4>Internal Links</h4>

                                            {getInternalLinksForNode(node).map((link: NOCLinkInternal, index) => (
                                                <div key={index}>
                                                    <h5>
                                                        <input
                                                            type="checkbox"
                                                            checked={link.selected}
                                                            onChange={(e) => {
                                                                selectLink(node, link.id, e.target.checked);
                                                            }}
                                                        />
                                                        <span>
                                                            {link.id} - {convertBytes(link.totalDataBytes)} - {convertBytes(link.bpc, 2)} of {convertBytes(link.maxBandwidth)}
                                                        </span>
                                                    </h5>
                                                    <ul className="node-pipelist">
                                                        {getPipesForLink(link).map((pipe: Pipe, pi) => (
                                                            <li key={pi}>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={pipe.selected}
                                                                    onChange={(e) => {
                                                                        selectLinksByPipe(pipe.id, e.target.checked);
                                                                    }}
                                                                />
                                                                <span className="label">
                                                                    {pipe.id}:{convertBytes(pipe.bandwidth)}
                                                                </span>
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
                                                        <input
                                                            type="checkbox"
                                                            checked={link.selected}
                                                            onChange={(e) => {
                                                                selectLink(node, link.id, e.target.checked);
                                                            }}
                                                        />
                                                        <span>
                                                            {link.id} - {convertBytes(link.totalDataBytes)} - {link.bpc}, {convertBytes(link.bpc, 2)} of {convertBytes(link.maxBandwidth)}
                                                        </span>
                                                    </h5>
                                                    <ul className="node-pipelist">
                                                        {getPipesForLink(link).map((pipe: Pipe, pi) => (
                                                            <li key={pi}>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={pipe.selected}
                                                                    onChange={(e) => {
                                                                        selectLinksByPipe(pipe.id, e.target.checked);
                                                                    }}
                                                                />
                                                                <span className="label">
                                                                    {pipe.id}:{convertBytes(pipe.bandwidth)}
                                                                </span>
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
                        <>
                            <Button icon={IconNames.CLEAN} onClick={clearAll}>
                                Clear pipes
                            </Button>

                            <div className="properties-panel__content">{html}</div>
                        </>
                    }
                />
                <Tab id="tab3" title="Tab 3" panel={<div>Content for Tab 3</div>}/>
            </Tabs>
        </div>
    );
}
