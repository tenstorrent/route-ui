import React, {useContext, useEffect} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {Button, Card, Dialog, Drawer, Overlay} from '@blueprintjs/core';
import {closeDetailedView, RootState} from '../../data/store';
import DataSource, {SVGContext} from '../../data/DataSource';
import {ComputeNode} from '../../data/DataStructures';

const DetailedView: React.FC = () => {
    const {svgData} = useContext<SVGContext>(DataSource);
    const dispatch = useDispatch();
    const {isOpen, uid} = useSelector((state: RootState) => state.detailedView);
    const [node, setNode] = React.useState<ComputeNode | null>(null);
    useEffect(() => {
        if (uid !== null) {
            setNode(svgData.nodes.find((n) => n.uid === uid) || null);
        }
    }, [uid]);

    return (
        <Overlay
            isOpen={isOpen}
            // canOutsideClickClose={true}
            hasBackdrop={false}
        >
            <Card
                className="detailed-view-card"
                style={{
                    bottom: '10px',
                    left: '10px',
                    zIndex: 100,
                }}
            >
                <>
                    <Button onClick={() => dispatch(closeDetailedView())}>Close</Button>{' '}
                    {node && (
                        <span>
                            {node.loc.x}-{node.loc.y}
                        </span>
                    )}
                    <hr />
                    <div className="detailed-view-wrap">
                        <WormholeDram />
                    </div>
                </>
            </Card>
        </Overlay>
    );
};
export default DetailedView;

const WormholeDram: React.FC = () => {
    return (
        <svg width="1108" height="353" viewBox="0 0 1108 353" fill="none" xmlns="http://www.w3.org/2000/svg" className='detailed-view-svg'>
            <g id="Wormhole DRAM">
                <g id="node0">
                    <rect id="noc0router" width="150" height="50"  />
                    <rect id="noc1router" x="190" width="150" height="50"  />
                    <rect id="noc2axi0" y="110" width="150" height="50"  />
                    <rect id="noc2axi1" x="190" y="110" width="150" height="50"  />

                    <text id="NOC0 ROUTER" fill="black" xmlSpace="preserve" fontSize="12" letterSpacing="0em">
                        <tspan x="32" y="29.8636">
                            NOC0 ROUTER
                        </tspan>
                    </text>
                    <text id="NOC1 ROUTER" fill="black" xmlSpace="preserve" fontSize="12" letterSpacing="0em">
                        <tspan x="223" y="29.8636">
                            NOC1 ROUTER
                        </tspan>
                    </text>
                    <text id="NOC2AXI" fill="black" xmlSpace="preserve" fontSize="12" letterSpacing="0em">
                        <tspan x="48.4219" y="139.864">
                            NOC2AXI
                        </tspan>
                    </text>
                    <text id="NOC2AXI_2" fill="black" xmlSpace="preserve" fontSize="12" letterSpacing="0em">
                        <tspan x="238.422" y="139.864">
                            NOC2AXI
                        </tspan>
                    </text>
                </g>

                <g id="node1">
                    <rect id="noc0router" x="384" width="150" height="50"  />
                    <rect id="noc1router" x="574" width="150" height="50"  />
                    <rect id="noc2axi0" x="384" y="110" width="150" height="50"  />
                    <rect id="noc2axi1" x="574" y="110" width="150" height="50"  />
                    <text id="NOC0 ROUTER_2" fill="black" xmlSpace="preserve" fontSize="12" letterSpacing="0em">
                        <tspan x="416" y="29.8636">
                            NOC0 ROUTER
                        </tspan>
                    </text>
                    <text id="NOC1 ROUTER_2" fill="black" xmlSpace="preserve" fontSize="12" letterSpacing="0em">
                        <tspan x="607" y="29.8636">
                            NOC1 ROUTER
                        </tspan>
                    </text>
                    <text id="NOC2AXI_3" fill="black" xmlSpace="preserve" fontSize="12" letterSpacing="0em">
                        <tspan x="432.422" y="139.864">
                            NOC2AXI
                        </tspan>
                    </text>
                    <text id="NOC2AXI_4" fill="black" xmlSpace="preserve" fontSize="12" letterSpacing="0em">
                        <tspan x="622.422" y="139.864">
                            NOC2AXI
                        </tspan>
                    </text>
                </g>
                <g id="node2">
                    <rect id="noc0router" x="768" width="150" height="50"  />
                    <rect id="noc1router" x="958" width="150" height="50"  />
                    <rect id="noc2axi0" x="768" y="110" width="150" height="50"  />
                    <rect id="noc2axi1" x="958" y="110" width="150" height="50"  />
                    <text id="NOC0 ROUTER_3" fill="black" xmlSpace="preserve" fontSize="12" letterSpacing="0em">
                        <tspan x="800" y="29.8636">
                            NOC0 ROUTER
                        </tspan>
                    </text>
                    <text id="NOC1 ROUTER_3" fill="black" xmlSpace="preserve" fontSize="12" letterSpacing="0em">
                        <tspan x="991" y="29.8636">
                            NOC1 ROUTER
                        </tspan>
                    </text>
                    <text id="NOC2AXI_5" fill="black" xmlSpace="preserve" fontSize="12" letterSpacing="0em">
                        <tspan x="816.422" y="139.864">
                            NOC2AXI
                        </tspan>
                    </text>
                    <text id="NOC2AXI_6" fill="black" xmlSpace="preserve" fontSize="12" letterSpacing="0em">
                        <tspan x="1006.42" y="139.864">
                            NOC2AXI
                        </tspan>
                    </text>
                </g>
                <rect id="axidram0" x="172" y="320" width="214" height="33"  />
                <rect id="axixbar" y="220" width="1108" height="50"  />
                <text id="AXI 6:1 XBAR" fill="black" xmlSpace="preserve" fontSize="12" letterSpacing="0em">
                    <tspan x="549.508" y="241.864">
                        AXI&#10;
                    </tspan>
                    <tspan x="533.482" y="256.864">
                        6:1 XBAR
                    </tspan>
                </text>
                <rect id="axidram1" x="740" y="320" width="214" height="33"  />
                <text id="AXI DRAM1" fill="black" xmlSpace="preserve" fontSize="12" letterSpacing="0em">
                    <tspan x="834.008" y="332.864">
                        AXI&#10;
                    </tspan>
                    <tspan x="823.168" y="347.864">
                        DRAM1
                    </tspan>
                </text>
                <text id="AXI DRAM0" fill="black" xmlSpace="preserve" fontSize="12" letterSpacing="0em">
                    <tspan x="266.008" y="332.864">
                        AXI&#10;
                    </tspan>
                    <tspan x="254.207" y="347.864">
                        DRAM0
                    </tspan>
                </text>
            </g>
        </svg>
    );
};
const GreyskullDram: React.FC = () => {
    return (
        <svg width="340" height="353" viewBox="0 0 340 353" fill="none" xmlns="http://www.w3.org/2000/svg" className="detailed-view-svg">
            <g id="group">
                <rect id="noc0router" width="150" height="50" />
                <rect id="noc1router" x="190" width="150" height="50" />
                <rect id="noc2axi0" y="110" width="150" height="50" />
                <rect id="noc2axi1" x="190" y="110" width="150" height="50" />
                <rect id="axi" x="72" y="220" width="214" height="50" />
                <rect id="offchip" x="72" y="320" width="214" height="33"  />
                <text id="NOC0 ROUTER" fill="black" xmlSpace="preserve" fontSize="12" letterSpacing="0em">
                    <tspan x="32" y="29.8636">
                        NOC0 ROUTER
                    </tspan>
                </text>
                <text id="NOC1 ROUTER" fill="black" xmlSpace="preserve" fontSize="12" letterSpacing="0em">
                    <tspan x="223" y="29.8636">
                        NOC1 ROUTER
                    </tspan>
                </text>
                <text id="NOC2AXI" fill="black" xmlSpace="preserve" fontSize="12" letterSpacing="0em">
                    <tspan x="48.4219" y="139.864">
                        NOC2AXI
                    </tspan>
                </text>
                <text id="NOC2AXI_2" fill="black" xmlSpace="preserve" fontSize="12" letterSpacing="0em">
                    <tspan x="238.422" y="139.864">
                        NOC2AXI
                    </tspan>
                </text>
                <text id="AXI 2:1 XBAR" fill="black" xmlSpace="preserve" fontSize="12" letterSpacing="0em">
                    <tspan x="166.008" y="241.864">
                        AXI&#10;
                    </tspan>
                    <tspan x="150.094" y="256.864">
                        2:1 XBAR
                    </tspan>
                </text>
                <text id="Off-Chip DRAM" fill="black" xmlSpace="preserve" fontSize="12" letterSpacing="0em">
                    <tspan x="131.295" y="340.864">
                        Off-Chip DRAM
                    </tspan>
                </text>
            </g>
        </svg>
    );
};
