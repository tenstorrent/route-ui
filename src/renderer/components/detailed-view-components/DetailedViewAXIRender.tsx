// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent Inc.

import React from 'react';
import { DramBankLink, NOC2AXILink, NOCLink, NetworkLink } from '../../../data/GraphOnChip';
import { DramBankLinkName, NOC, NetworkLinkName } from '../../../data/Types';
import DetailedViewPipeRenderer from './DetailedViewPipeRenderer';
import type { LinkState } from '../../../data/StateTypes';

interface DetailedViewAXIRenderProps {
    links: DramBankLink[] | NetworkLink[];
    allLinksState: Record<string, LinkState>;
    nodeUid: string;
    filter: DramBankLinkName | NetworkLinkName | null;
    label: string;
}

export const DetailedViewAXIRender: React.FC<DetailedViewAXIRenderProps> = ({
    links,
    allLinksState,
    nodeUid,
    filter,
    label,
}) => {
    return (
        <div className='axi-dram-wrap'>
            <DetailedViewPipeRenderer
                className='centered-svg'
                links={links.filter((link) => (filter === null ? true : link.name === filter))}
                allLinksState={allLinksState}
                nodeUid={nodeUid}
            />
            <div className='axi-dram'>
                <p className='label'>{label}</p>
            </div>
        </div>
    );
};

interface DetailedViewANOC2XIRenderProps {
    links: NOC2AXILink[] | NOCLink[];
    allLinksState: Record<string, LinkState>;
    nodeUid: string;
    noc: NOC;
}

export const DetailedViewNOC2AXIRender: React.FC<DetailedViewANOC2XIRenderProps> = ({
    links,
    allLinksState,
    nodeUid,
    noc,
}) => {
    return (
        <>
            <div className='noc2axi'>
                <p className='label'>NOC2AXI</p>
            </div>
            <DetailedViewPipeRenderer
                className='centered-svg'
                links={links.filter((link) => (noc === NOC.ANY ? true : link.noc === noc))}
                allLinksState={allLinksState}
                nodeUid={nodeUid}
            />
        </>
    );
};
