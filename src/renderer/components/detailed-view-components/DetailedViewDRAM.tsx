// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent AI ULC

import { Button } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { updateNodeSelection } from 'data/store/slices/nodeSelection.slice';
import { openDetailedView } from 'data/store/slices/uiState.slice';
import React, { useMemo } from 'react';
import { useDispatch } from 'react-redux';
import GraphOnChip, { ComputeNode, NOCLink } from '../../../data/GraphOnChip';
import { Architecture, DramBankLinkName, NOC, NOCLinkName } from '../../../data/Types';
import { filterIterable } from '../../../utils/IterableHelpers';
import LinkDetails from '../LinkDetails';
import { DetailedViewAXIRender, DetailedViewNOC2AXIRender } from './DetailedViewAXIRender';
import DetailedViewNOCRouterRenderer from './DetailedViewNOCRouterRenderer';
import DetailedViewPipeControls from './DetailedViewPipeControls';

interface DetailedViewDRAMRendererProps {
    node: ComputeNode;
    temporalEpoch: number;
    graphOnChip?: GraphOnChip;
}

const DetailedViewDRAMRenderer: React.FC<DetailedViewDRAMRendererProps> = ({ node, temporalEpoch, graphOnChip }) => {
    const architecture = graphOnChip?.architecture ?? Architecture.NONE;
    const dispatch = useDispatch();

    const nodeList = useMemo(() => {
        if (graphOnChip && node.dramChannelId > -1) {
            return [...filterIterable(graphOnChip?.nodes, (n) => n.dramChannelId === node.dramChannelId)];
        }
        return [];
    }, [node, graphOnChip]);

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
                                                            temporalEpoch,
                                                            id: currentNode.uid,
                                                            selected: true,
                                                        }),
                                                    );
                                                    dispatch(
                                                        openDetailedView({
                                                            nodeUid: currentNode.uid,
                                                            chipId: currentNode.chipId,
                                                        }),
                                                    );
                                                }}
                                            />
                                        )}
                                        Sub {subchannel.subchannelId} [{currentNode?.loc.x},{currentNode?.loc.y}]
                                    </h3>
                                )}
                                <DetailedViewPipeControls node={currentNode} numPipes={numPipes} />
                                <div className='node'>
                                    <div className='col noc0'>
                                        <DetailedViewNOCRouterRenderer
                                            links={noc0links}
                                            temporalEpoch={temporalEpoch}
                                            label='NOC0'
                                            nodeUid={node.uid}
                                        />
                                        <DetailedViewNOC2AXIRender
                                            links={subchannel.links}
                                            temporalEpoch={temporalEpoch}
                                            noc={NOC.NOC0}
                                            nodeUid={node.uid}
                                        />
                                    </div>
                                    <div className='col noc1'>
                                        <DetailedViewNOCRouterRenderer
                                            links={noc1links}
                                            temporalEpoch={temporalEpoch}
                                            label='NOC1'
                                            nodeUid={node.uid}
                                        />
                                        <DetailedViewNOC2AXIRender
                                            links={subchannel.links}
                                            temporalEpoch={temporalEpoch}
                                            noc={NOC.NOC1}
                                            nodeUid={node.uid}
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
                            <DetailedViewAXIRender
                                links={dram.links}
                                temporalEpoch={temporalEpoch}
                                nodeUid={node.uid}
                                filter={DramBankLinkName.DRAM0_INOUT}
                                label='AXI DRAM0'
                            />
                            <DetailedViewAXIRender
                                links={dram.links}
                                temporalEpoch={temporalEpoch}
                                nodeUid={node.uid}
                                filter={DramBankLinkName.DRAM1_INOUT}
                                label='AXI DRAM1'
                            />
                        </>
                    )}
                    {architecture === Architecture.GRAYSKULL && (
                        <DetailedViewAXIRender
                            links={dram.links}
                            temporalEpoch={temporalEpoch}
                            nodeUid={node.uid}
                            filter={DramBankLinkName.DRAM_INOUT}
                            label='Off-chip DRAM'
                        />
                    )}
                </div>
            </div>
            <div className='detailed-view-link-info'>
                <div className='node-links-wrap'>
                    {nodeList.map((n, index) => {
                        return n.getInternalLinksForNode().map((link) => {
                            return (
                                <LinkDetails
                                    key={link.name}
                                    link={link}
                                    nodeUid={n.uid}
                                    temporalEpoch={temporalEpoch}
                                    index={nodeList.length > 1 ? index : -1}
                                    showEmpty={false}
                                />
                            );
                        });
                    })}
                    {dram.subchannels.map((sub) =>
                        sub.links.map((link) => (
                            <LinkDetails
                                key={link.name}
                                index={nodeList.length > 1 ? sub.subchannelId : -1}
                                link={link}
                                nodeUid={node.uid}
                                temporalEpoch={temporalEpoch}
                                showEmpty={false}
                            />
                        )),
                    )}
                    {dram.links.map((link) => (
                        <LinkDetails
                            key={link.name}
                            nodeUid={node.uid}
                            temporalEpoch={temporalEpoch}
                            link={link}
                            showEmpty={false}
                        />
                    ))}
                </div>
            </div>
        </>
    );
};

DetailedViewDRAMRenderer.defaultProps = {
    graphOnChip: undefined,
};

export default DetailedViewDRAMRenderer;
