import React, { useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Card, Overlay } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import {
    closeDetailedView,
    openDetailedView,
    RootState,
    updateNodeSelection,
    updatePipeSelection,
} from '../../data/store';
import DataSource, { GridContext } from '../../data/DataSource';
import { ComputeNode, DramChannel, NOCLink } from '../../data/Chip';
import '../scss/DetailedView.scss';
import DetailedViewPipeRenderer from './detailed-view-components/DetailedViewPipeRenderer';
import LinkDetails from './LinkDetails';
import { Architecture, ComputeNodeType, NOCLinkName, NOC, DramBankLinkName } from '../../data/Types';
import { filterIterable } from '../../utils/IterableHelpers';

interface DetailedViewProps {
    showLinkSaturation: boolean;
    linkSaturationTreshold: number;
    zoom: number;
}

const HighlightBorder = () => {};

const DetailedView: React.FC<DetailedViewProps> = ({ showLinkSaturation, linkSaturationTreshold, zoom }) => {
    const { chip } = useContext<GridContext>(DataSource);
    const architecture = useSelector((state: RootState) => state.nodeSelection.architecture);
    const dispatch = useDispatch();
    const { isOpen, uid } = useSelector((state: RootState) => state.detailedView);
    const [node, setNode] = React.useState<ComputeNode | null>(null);
    const [nodeList, setNodeList] = React.useState<ComputeNode[]>([]);
    const [dram, setDram] = React.useState<DramChannel | null>(null);
    useEffect(() => {
        if (chip && uid !== null) {
            const selectedNode = chip.getNode(uid);
            let allNodes: ComputeNode[] | undefined;
            if (selectedNode && selectedNode.dramChannelId > -1) {
                allNodes = [...filterIterable(chip.nodes, (n) => n.dramChannelId === selectedNode?.dramChannelId)];
            }

            setNode(selectedNode || null);
            setNodeList(allNodes || []);
            setDram(selectedNode?.dramChannel || null);
        }
    }, [uid, chip, isOpen, showLinkSaturation]);

    const changePipeState = (pipeList: string[], state: boolean) => {
        pipeList.forEach((pipeId) => {
            dispatch(updatePipeSelection({ id: pipeId, selected: state }));
        });
    };

    return (
        <Overlay isOpen={isOpen} enforceFocus={false} hasBackdrop={false}>
            <Card
                className='detailed-view-card'
                style={{
                    bottom: '10px',
                    left: '10px',
                    zIndex: 100,
                    zoom,
                }}
            >
                <div className='detailed-view-header'>
                    {node && (
                        <h3>
                            {node.type} {node.loc.x},{node.loc.y}
                        </h3>
                    )}
                    <Button small icon={IconNames.CROSS} onClick={() => dispatch(closeDetailedView())} />
                </div>
                <div className={`detailed-view-wrap arch-${architecture} type-${node?.type}`}>
                    {node?.type === ComputeNodeType.DRAM && dram && (
                        <>
                            <div className='detailed-view-chip dram'>
                                <div className='dram-subchannels'>
                                    {dram?.subchannels.map((subchannel) => {
                                        const currentNode = nodeList.find(
                                            (n) => n.dramSubchannelId === subchannel.subchannelId,
                                        );
                                        const noc0links: NOCLink[] = [];
                                        const noc1links: NOCLink[] = [];
                                        if (currentNode) {
                                            noc0links.push(currentNode.links.get(NOCLinkName.NOC0_IN) as NOCLink);
                                            noc0links.push(currentNode.links.get(NOCLinkName.NOC0_OUT) as NOCLink);
                                            noc1links.push(currentNode.links.get(NOCLinkName.NOC1_IN) as NOCLink);
                                            noc1links.push(currentNode.links.get(NOCLinkName.NOC1_OUT) as NOCLink);
                                        }
                                        const numPipes = subchannel.links.map((link) => link.pipes).flat().length;
                                        return (
                                            <div
                                                key={subchannel.subchannelId}
                                                // prettier-ignore
                                                className={`subchannel ${node?.dramSubchannelId === subchannel.subchannelId ? 'current' : ''}`}
                                            >
                                                {dram?.subchannels.length > 1 && (
                                                    <h3 className='subchannel-name'>
                                                        {currentNode && (
                                                            <Button
                                                                style={{ marginRight: '5px' }}
                                                                small
                                                                disabled={currentNode.uid === node.uid}
                                                                icon={IconNames.PROPERTIES}
                                                                onClick={() => {
                                                                    dispatch(
                                                                        updateNodeSelection({
                                                                            id: currentNode.uid,
                                                                            selected: true,
                                                                        }),
                                                                    );
                                                                    dispatch(openDetailedView(currentNode.uid));
                                                                }}
                                                            />
                                                        )}
                                                        Sub {subchannel.subchannelId} [{currentNode?.loc.x},
                                                        {currentNode?.loc.y}]
                                                    </h3>
                                                )}
                                                <div className='controls-wrap'>
                                                    <Button
                                                        className='pipe-selection'
                                                        small
                                                        icon={IconNames.FILTER_LIST}
                                                        disabled={numPipes === 0}
                                                        onClick={() =>
                                                            changePipeState(
                                                                currentNode?.getInternalPipeIDsForNode() || [],
                                                                true,
                                                            )
                                                        }
                                                    />
                                                    <Button
                                                        className='pipe-selection'
                                                        small
                                                        icon={IconNames.FILTER_REMOVE}
                                                        disabled={numPipes === 0}
                                                        onClick={() =>
                                                            changePipeState(
                                                                currentNode?.getInternalPipeIDsForNode() || [],
                                                                false,
                                                            )
                                                        }
                                                    />
                                                </div>
                                                <div className='dram-subchannel'>
                                                    <div className='noc noc0'>
                                                        <div className=' router'>
                                                            <p className='label'>
                                                                NOC0
                                                                <br />
                                                                Router
                                                            </p>
                                                        </div>
                                                        <DetailedViewPipeRenderer
                                                            links={noc0links}
                                                            showLinkSaturation={showLinkSaturation}
                                                            linkSaturationTreshold={linkSaturationTreshold}
                                                        />
                                                        <div className='noc2axi'>
                                                            <p className='label'>NOC2AXI</p>
                                                        </div>
                                                        <DetailedViewPipeRenderer
                                                            className='centered-svg'
                                                            links={subchannel.links.filter(
                                                                (link) => link.noc === NOC.NOC0,
                                                            )}
                                                            showLinkSaturation={showLinkSaturation}
                                                            linkSaturationTreshold={linkSaturationTreshold}
                                                        />
                                                    </div>
                                                    <div className='noc noc1'>
                                                        <div className='router'>
                                                            <p className='label'>
                                                                NOC1
                                                                <br />
                                                                Router
                                                            </p>
                                                        </div>
                                                        <DetailedViewPipeRenderer
                                                            links={noc1links}
                                                            showLinkSaturation={showLinkSaturation}
                                                            linkSaturationTreshold={linkSaturationTreshold}
                                                        />
                                                        <div className='noc2axi'>
                                                            <p className='label'>NOC2AXI</p>
                                                        </div>
                                                        <DetailedViewPipeRenderer
                                                            className='centered-svg'
                                                            links={subchannel.links.filter(
                                                                (link) => link.noc === NOC.NOC1,
                                                            )}
                                                            showLinkSaturation={showLinkSaturation}
                                                            linkSaturationTreshold={linkSaturationTreshold}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className='axi'>
                                    <p className='label'>AXI</p>
                                    {architecture === Architecture.WORMHOLE && <>6:2 XBAR</>}
                                    {architecture === Architecture.GRAYSKULL && <>2:1 XBAR</>}
                                </div>
                                <div className='off-chip'>
                                    {architecture === Architecture.WORMHOLE && (
                                        <>
                                            <div className='axi-dram-wrap'>
                                                <DetailedViewPipeRenderer
                                                    className='centered-svg'
                                                    links={dram.links.filter(
                                                        (link) => link.name === DramBankLinkName.DRAM0_INOUT,
                                                    )}
                                                    showLinkSaturation={showLinkSaturation}
                                                    linkSaturationTreshold={linkSaturationTreshold}
                                                />
                                                <div className='axi-dram'>
                                                    <p className='label'>AXI DRAM0</p>
                                                </div>
                                            </div>
                                            <div className='axi-dram-wrap'>
                                                <DetailedViewPipeRenderer
                                                    className='centered-svg'
                                                    links={dram.links.filter(
                                                        (link) => link.name === DramBankLinkName.DRAM1_INOUT,
                                                    )}
                                                    showLinkSaturation={showLinkSaturation}
                                                    linkSaturationTreshold={linkSaturationTreshold}
                                                />
                                                <div className='axi-dram'>
                                                    <p className='label'>AXI DRAM1</p>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                    {architecture === Architecture.GRAYSKULL && (
                                        <div className='axi-dram-wrap'>
                                            <DetailedViewPipeRenderer
                                                className='centered-svg'
                                                links={dram.links.filter(
                                                    (link) => link.name === DramBankLinkName.DRAM_INOUT,
                                                )}
                                                showLinkSaturation={showLinkSaturation}
                                                linkSaturationTreshold={linkSaturationTreshold}
                                            />
                                            <div className='axi-dram'>
                                                <p className='label'>Off-chip DRAM</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className='detailed-view-data'>
                                <div className='node-links-wrap'>
                                    {nodeList.map((n, index) => {
                                        return node.getInternalLinksForNode().map((link: NOCLink) => {
                                            return (
                                                <LinkDetails
                                                    key={link.name}
                                                    link={link}
                                                    index={nodeList.length > 1 ? index : -1}
                                                    showEmpty={false}
                                                />
                                            );
                                        });
                                    })}
                                    {dram.subchannels.map((sub) =>
                                        sub.links.map((link) => (
                                            //
                                            <LinkDetails
                                                key={link.name}
                                                index={nodeList.length > 1 ? sub.subchannelId : -1}
                                                link={link}
                                                showEmpty={false}
                                            />
                                        )),
                                    )}
                                    {dram.links.map((link) => (
                                        //
                                        <LinkDetails key={link.name} link={link} showEmpty={false} />
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </Card>
        </Overlay>
    );
};
export default DetailedView;
