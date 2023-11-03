import React, { useContext, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { openDetailedView, RootState, updateNodeSelection } from '../../../data/store';
import { ComputeNode, DramBankLink, DramNOCLink, NOCLink } from '../../../data/Chip';
import { Architecture, DramBankLinkName, NOC, NOCLinkName } from '../../../data/Types';
import DetailedViewPipeRenderer from './DetailedViewPipeRenderer';
import LinkDetails from '../LinkDetails';
import { filterIterable } from '../../../utils/IterableHelpers';
import DataSource, { GridContext } from '../../../data/DataSource';
import DetailedViewPipeControls from './DetailedViewPipeControls';
import DetailedViewNOCRouterRenderer from './DetailedViewNOCRouterRenderer';

interface DetailedViewDRAMRendererProps {
    node: ComputeNode;
}

const DetailedViewDRAMRenderer: React.FC<DetailedViewDRAMRendererProps> = ({ node }) => {
    const { chip } = useContext<GridContext>(DataSource);
    const architecture = useSelector((state: RootState) => state.nodeSelection.architecture);
    const dispatch = useDispatch();

    const nodeList = useMemo(() => {
        if (chip && node.dramChannelId > -1) {
            return [...filterIterable(chip?.nodes, (n) => n.dramChannelId === node.dramChannelId)];
        }
        return [];
    }, [node, chip]);

    const dram = node.dramChannel || null;

    if (dram === null) {
        return null;
    }
    return (
        <>
            <div className='detailed-view-chip dram'>
                <div className='node-container'>
                    {dram.subchannels.map((subchannel) => {
                        const currentNode = nodeList.find((n) => n.dramSubchannelId === subchannel.subchannelId);
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
                                className={`subchannel ${node.dramSubchannelId === subchannel.subchannelId ? 'current' : ''}`}
                            >
                                {dram.subchannels.length > 1 && (
                                    <h3 className='subchannel-name'>
                                        {currentNode && (
                                            <Button
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
                                        Sub {subchannel.subchannelId} [{currentNode?.loc.x},{currentNode?.loc.y}]
                                    </h3>
                                )}
                                <DetailedViewPipeControls node={currentNode} numPipes={numPipes} />
                                <div className='node'>
                                    <div className='col noc0'>
                                        <DetailedViewNOCRouterRenderer links={noc0links} label="NOC0" />
                                        <DetailedViewNOC2AXIRender links={subchannel.links} noc={NOC.NOC0} />

                                    </div>
                                    <div className='col noc1'>
                                        <DetailedViewNOCRouterRenderer links={noc1links} label="NOC1" />
                                        <DetailedViewNOC2AXIRender links={subchannel.links} noc={NOC.NOC1} />
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
                            <DetailedViewAXIRender links={dram.links} filter={DramBankLinkName.DRAM0_INOUT} label='AXI DRAM0' />
                            <DetailedViewAXIRender links={dram.links} filter={DramBankLinkName.DRAM1_INOUT} label='AXI DRAM1' />
                        </>
                    )}
                    {architecture === Architecture.GRAYSKULL && (
                        <DetailedViewAXIRender links={dram.links} filter={DramBankLinkName.DRAM_INOUT} label='Off-chip DRAM' />
                    )}
                </div>
            </div>
            <div className='detailed-view-link-info'>
                <div className='node-links-wrap'>
                    {nodeList.map((n, index) => {
                        return node.getInternalLinksForNode().map((link) => {
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
                        <LinkDetails key={link.name} link={link} showEmpty={false} />
                    ))}
                </div>
            </div>
        </>
    );
};

export default DetailedViewDRAMRenderer;

interface DetailedViewAXIRenderProps {
    links: DramBankLink[];
    filter: DramBankLinkName;
    label: string;
}

const DetailedViewAXIRender: React.FC<DetailedViewAXIRenderProps> = ({ links, filter, label }) => {
    return (
        <div className='axi-dram-wrap'>
            <DetailedViewPipeRenderer
                className='centered-svg'
                links={links.filter((link) => link.name === filter)}
            />
            <div className='axi-dram'>
                <p className='label'>{label}</p>
            </div>
        </div>
    );
};

interface DetailedViewANOC2XIRenderProps {
    links: DramNOCLink[];
    noc: NOC;
}

const DetailedViewNOC2AXIRender: React.FC<DetailedViewANOC2XIRenderProps> = ({ links, noc}) => {
    return (
        <>
            <div className='noc2axi'>
                <p className='label'>NOC2AXI</p>
            </div>
            <DetailedViewPipeRenderer
                className='centered-svg'
                links={links.filter((link) => link.noc === noc)}
            />
        </>
    );
};
