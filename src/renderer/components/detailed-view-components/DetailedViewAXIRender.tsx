// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent AI ULC

import React from 'react';
import { DramBankLink, NOC2AXILink, NOCLink, NetworkLink } from '../../../data/GraphOnChip';
import { DramBankLinkName, NOC, NetworkLinkName } from '../../../data/Types';
import DetailedViewPipeRenderer from './DetailedViewPipeRenderer';

interface DetailedViewAXIRenderProps {
    links: DramBankLink[] | NetworkLink[];
    filter: DramBankLinkName | NetworkLinkName | null;
    label: string;
}

export const DetailedViewAXIRender: React.FC<DetailedViewAXIRenderProps> = ({ links, filter, label }) => {
    return (
        <div className='axi-dram-wrap'>
            <DetailedViewPipeRenderer
                className='centered-svg'
                links={links.filter((link) => (filter === null ? true : link.name === filter))}
            />
            <div className='axi-dram'>
                <p className='label'>{label}</p>
            </div>
        </div>
    );
};

interface DetailedViewANOC2XIRenderProps {
    links: NOC2AXILink[] | NOCLink[];
    noc: NOC;
}

export const DetailedViewNOC2AXIRender: React.FC<DetailedViewANOC2XIRenderProps> = ({ links, noc }) => {
    return (
        <>
            <div className='noc2axi'>
                <p className='label'>NOC2AXI</p>
            </div>
            <DetailedViewPipeRenderer
                className='centered-svg'
                links={links.filter((link) => (noc === NOC.ANY ? true : link.noc === noc))}
            />
        </>
    );
};
