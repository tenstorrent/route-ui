import React, {useContext, useEffect, useRef} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Button, Card, Overlay, Tooltip} from '@blueprintjs/core';
import {IconNames} from '@blueprintjs/icons';
import {closeDetailedView, openDetailedView, RootState, updateNodeSelection, updatePipeSelection} from '../../data/store';
import DataSource, {SVGContext} from '../../data/DataSource';
import {ARCHITECTURE, ComputeNode, ComputeNodeType, DramChannel, DramID, LinkID, NOC, NOCLink} from '../../data/DataStructures';
import './detailed-view-components/DetailedView.scss';
import PipeRenderer from './detailed-view-components/PipeRenderer';
import {getInternalPipeIDsForNode} from '../../data/utils';

interface DetailedViewProps {
    showLinkSaturation: boolean;
    linkSaturationTreshold: number;
}

const DetailedView: React.FC<DetailedViewProps> = ({showLinkSaturation, linkSaturationTreshold}) => {
    const {svgData} = useContext<SVGContext>(DataSource);
    const architecture = useSelector((state: RootState) => {
        return state.nodeSelection.architecture;
    });
    const dispatch = useDispatch();
    const {isOpen, uid} = useSelector((state: RootState) => state.detailedView);
    const [node, setNode] = React.useState<ComputeNode | null>(null);
    const [nodeList, setNodeList] = React.useState<ComputeNode[]>([]);
    const [dram, setDram] = React.useState<DramChannel | null>(null);
    useEffect(() => {
        if (svgData && uid !== null) {
            const selectedNode = svgData.nodes.find((n) => n.uid === uid);
            let allNodes: ComputeNode[] | undefined;
            if (selectedNode && selectedNode.dramChannel > -1) {
                allNodes = svgData?.nodes.filter((n) => n.dramChannel === selectedNode?.dramChannel);
            }

            setNode(selectedNode || null);
            setNodeList(allNodes || []);
            setDram(svgData?.dramChannels.find((d) => d.id === selectedNode?.dramChannel) || null);
        }
    }, [uid, svgData, isOpen]);

    const changePipeState = (pipeList: string[], state: boolean) => {
        pipeList.forEach((pipeId) => {
            dispatch(updatePipeSelection({id: pipeId, selected: state}));
        });
    };

    return (
        <Overlay isOpen={isOpen} enforceFocus={false} hasBackdrop={false}>
            <Card
                className="detailed-view-card"
                style={{
                    bottom: '10px',
                    left: '10px',
                    zIndex: 100,
                }}
            >
                <div className="detailed-view-header">
                    {node && (
                        <h3>
                            {node.type} {node.loc.x},{node.loc.y}
                        </h3>
                    )}
                    <Button small icon={IconNames.CROSS} onClick={() => dispatch(closeDetailedView())} />
                </div>
                <div className={`detailed-view-wrap arch-${architecture} type-${node?.type}`}>
                    {node?.type === ComputeNodeType.DRAM && dram && (
                        <div className="dram">
                            <div className="dram-subchannels">
                                {dram?.subchannels.map((subchannel) => {
                                    const currentNode = nodeList.find((n) => n.dramSubchannel === subchannel.subchannelId);
                                    // console.log(nodeList);
                                    const noc0links: NOCLink[] = [];
                                    const noc1links: NOCLink[] = [];
                                    if (currentNode) {
                                        noc0links.push(currentNode.links.get(LinkID.NOC0_IN) as NOCLink);
                                        noc0links.push(currentNode.links.get(LinkID.NOC0_OUT) as NOCLink);
                                        noc1links.push(currentNode.links.get(LinkID.NOC1_IN) as NOCLink);
                                        noc1links.push(currentNode.links.get(LinkID.NOC1_OUT) as NOCLink);
                                    }
                                    return (
                                        <div key={subchannel.subchannelId} className={`${node?.dramSubchannel === subchannel.subchannelId ? 'current' : ''} subchannel`}>
                                            {dram?.subchannels.length > 1 && (
                                                <h3 className="subchannel-name">
                                                    {currentNode && (
                                                        <Button
                                                            style={{marginRight: '5px'}}
                                                            small
                                                            disabled={currentNode.uid === node.uid}
                                                            icon={IconNames.PROPERTIES}
                                                            onClick={() => {
                                                                dispatch(updateNodeSelection({id: currentNode.uid, selected: true}));
                                                                dispatch(openDetailedView(currentNode.uid));
                                                            }}
                                                        />
                                                    )}
                                                    Sub {subchannel.subchannelId} [{currentNode?.loc.x},{currentNode?.loc.y}]
                                                </h3>
                                            )}
                                            <Button
                                                className="pipe-selection"
                                                small
                                                icon={IconNames.FILTER_LIST}
                                                onClick={() => changePipeState(getInternalPipeIDsForNode(currentNode), true)}
                                            >
                                                Select internal pipes
                                            </Button>
                                            <div className="dram-subchannel">
                                                <div className="noc noc0">
                                                    <div className=" router">
                                                        <p className="label">
                                                            NOC0
                                                            <br />
                                                            Router
                                                        </p>
                                                    </div>
                                                    <PipeRenderer links={noc0links} />
                                                    <div className="noc2axi">
                                                        <p className="label">NOC2AXI</p>
                                                    </div>
                                                    <PipeRenderer className="centered-svg" links={subchannel.links.filter((link) => link.noc === NOC.NOC0)} />
                                                </div>
                                                <div className="noc noc1">
                                                    <div className="router">
                                                        <p className="label">
                                                            NOC1
                                                            <br />
                                                            Router
                                                        </p>
                                                    </div>
                                                    <PipeRenderer links={noc1links} />
                                                    <div className="noc2axi">
                                                        <p className="label">NOC2AXI</p>
                                                    </div>
                                                    <PipeRenderer className="centered-svg" links={subchannel.links.filter((link) => link.noc === NOC.NOC1)} />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="axi">
                                <p className="label">AXI</p>
                                {architecture === ARCHITECTURE.WORMHOLE && <>6:2 XBAR</>}
                                {architecture === ARCHITECTURE.GRAYSKULL && <>2:1 XBAR</>}
                            </div>
                            <div className="off-chip">
                                {architecture === ARCHITECTURE.WORMHOLE && (
                                    <>
                                        <div className="axi-dram-wrap">
                                            <PipeRenderer className="centered-svg" links={dram.links.filter((link) => link.id === DramID.DRAM0_INOUT)} />
                                            <div className="axi-dram">
                                                <p className="label">AXI DRAM0</p>
                                            </div>
                                        </div>
                                        <div className="axi-dram-wrap">
                                            <PipeRenderer className="centered-svg" links={dram.links.filter((link) => link.id === DramID.DRAM1_INOUT)} />
                                            <div className="axi-dram">
                                                <p className="label">AXI DRAM1</p>
                                            </div>
                                        </div>
                                    </>
                                )}
                                {architecture === ARCHITECTURE.GRAYSKULL && (
                                    <div className="axi-dram-wrap">
                                        <PipeRenderer className="centered-svg" links={dram.links.filter((link) => link.id === DramID.DRAM0_INOUT)} />
                                        <div className="axi-dram">
                                            <p className="label">Off-chip DRAM</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </Card>
        </Overlay>
    );
};
export default DetailedView;
