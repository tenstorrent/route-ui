// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent AI ULC

// new component DetailedViewDRAM

import React from 'react';
import { ComputeNode, NOCLink, NetworkLink } from '../../../data/GraphOnChip';
import { NOCLinkName } from '../../../data/Types';
import DetailedViewPipeRenderer from './DetailedViewPipeRenderer';
import LinkDetails from '../LinkDetails';
import DetailedViewPipeControls from './DetailedViewPipeControls';
import DetailedViewNOCRouterRenderer from './DetailedViewNOCRouterRenderer';

interface DetailedViewETHRendererProps {
    node: ComputeNode;
    temporalEpoch: number;
}

const DetailedViewETHRenderer: React.FC<DetailedViewETHRendererProps> = ({ node, temporalEpoch }) => {
    const noc0links: NOCLink[] = [
        node.links.get(NOCLinkName.NOC0_IN) as NOCLink,
        node.links.get(NOCLinkName.NOC0_OUT) as NOCLink,
    ];
    const noc1links: NOCLink[] = [
        node.links.get(NOCLinkName.NOC1_IN) as NOCLink,
        node.links.get(NOCLinkName.NOC1_OUT) as NOCLink,
    ];
    const internalNOCLinks: NetworkLink[] = [...node.internalLinks.values()];
    const numPipes = [...node.links.values()].map((link) => link.pipes).flat().length;

    return (
        <>
            <div className='detailed-view-chip eth'>
                <div>
                    <DetailedViewPipeControls node={node} numPipes={numPipes} />
                    <div className='chip-container'>
                        <div className='wrapper'>
                            <div className='node-container'>
                                <div className='node'>
                                    <div className='col noc0'>
                                        <DetailedViewNOCRouterRenderer
                                            links={noc0links}
                                            temporalEpoch={temporalEpoch}
                                            nodeUid={node.uid}
                                            label='NOC0'
                                        />
                                    </div>
                                    <div className='col noc1'>
                                        <DetailedViewNOCRouterRenderer
                                            links={noc1links}
                                            temporalEpoch={temporalEpoch}
                                            nodeUid={node.uid}
                                            label='NOC1'
                                        />
                                    </div>
                                    <div className='col'>
                                        <div className='router'>
                                            <p className='label single-line'>Ethernet</p>
                                        </div>
                                        <DetailedViewPipeRenderer
                                            links={internalNOCLinks}
                                            temporalEpoch={temporalEpoch}
                                            nodeUid={node.uid}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className='off-chip'>
                                <div className='axi'>
                                    <p className='label single-line'>L1</p>
                                </div>
                            </div>
                        </div>
                        <div className='col eth-off-chip'>
                            <DetailedViewPipeRenderer
                                links={internalNOCLinks}
                                temporalEpoch={temporalEpoch}
                                nodeUid={node.uid}
                                className='centered-svg'
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div className='detailed-view-link-info'>
                <div className='node-links-wrap'>
                    {node.getInternalLinksForNode().map((link: NetworkLink) => {
                        return (
                            <LinkDetails
                                nodeUid={node.uid}
                                temporalEpoch={temporalEpoch}
                                key={link.name}
                                link={link}
                                showEmpty={false}
                            />
                        );
                    })}
                </div>
            </div>
        </>
    );
};

export default DetailedViewETHRenderer;
