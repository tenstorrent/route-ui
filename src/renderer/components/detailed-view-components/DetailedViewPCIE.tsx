// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent Inc.

import React from 'react';
import { ComputeNode, NOC2AXILink, NOCLink, NetworkLink, PCIeLink } from '../../../data/GraphOnChip';
import { NOC, NOC2AXILinkName, NOCLinkName, PCIeLinkName } from '../../../data/Types';
import LinkDetails from '../LinkDetails';
import DetailedViewPipeControls from './DetailedViewPipeControls';
import DetailedViewNOCRouterRenderer from './DetailedViewNOCRouterRenderer';
import { DetailedViewAXIRender, DetailedViewNOC2AXIRender } from './DetailedViewAXIRender';

interface DetailedViewPCIERendererProps {
    node: ComputeNode;
    temporalEpoch: number;
}

const DetailedViewPCIERenderer: React.FC<DetailedViewPCIERendererProps> = ({ node, temporalEpoch }) => {
    const noc0links: NOCLink[] = [
        node.links.get(NOCLinkName.NOC0_IN) as NOCLink,
        node.links.get(NOCLinkName.NOC0_OUT) as NOCLink,
    ];
    const noc1links: NOCLink[] = [
        node.links.get(NOCLinkName.NOC1_IN) as NOCLink,
        node.links.get(NOCLinkName.NOC1_OUT) as NOCLink,
    ];

    const noc0axi: NOC2AXILink | null = (node.links.get(NOC2AXILinkName.NOC0_NOC2AXI) as NOC2AXILink) || null;
    const noc1axi: NOC2AXILink | null = (node.links.get(NOC2AXILinkName.NOC1_NOC2AXI) as NOC2AXILink) || null;
    const offChipPCIe: PCIeLink | null = (node.internalLinks.get(PCIeLinkName.PCIE_INOUT) as PCIeLink) || null;

    const numPipes = [...node.links.values()].map((link) => link.pipes).flat().length;

    return (
        <>
            <div className='detailed-view-chip pci'>
                <DetailedViewPipeControls node={node} numPipes={numPipes} />
                <div className='node-container'>
                    <div className='node'>
                        <div className='col noc0'>
                            <DetailedViewNOCRouterRenderer links={noc0links} nodeUid={node.uid} label='NOC0' />
                            <DetailedViewNOC2AXIRender
                                links={noc0axi ? [noc0axi] : []}
                                nodeUid={node.uid}
                                noc={NOC.ANY}
                            />
                        </div>
                        <div className='col noc1'>
                            <DetailedViewNOCRouterRenderer links={noc1links} nodeUid={node.uid} label='NOC1' />
                            <DetailedViewNOC2AXIRender
                                links={noc1axi ? [noc1axi] : []}
                                nodeUid={node.uid}
                                noc={NOC.ANY}
                            />
                        </div>
                    </div>
                </div>
                <div className='col'>
                    <div className='axi'>
                        <p className='label'>AXI</p>
                        2:1 XBAR
                    </div>
                    <div className='off-chip'>
                        <DetailedViewAXIRender
                            links={offChipPCIe ? [offChipPCIe] : []}
                            nodeUid={node.uid}
                            filter={null}
                            label='PCIe'
                        />
                    </div>
                </div>
            </div>
            <div className='detailed-view-link-info'>
                <div className='node-links-wrap'>
                    {node.getInternalLinksForNode().map((link: NetworkLink) => {
                        return (
                            <LinkDetails temporalEpoch={temporalEpoch} key={link.name} link={link} showEmpty={false} />
                        );
                    })}
                </div>
            </div>
        </>
    );
};

export default DetailedViewPCIERenderer;
