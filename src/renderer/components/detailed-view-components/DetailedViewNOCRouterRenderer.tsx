// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent Inc.

import React from 'react';
import { NetworkLink } from '../../../data/GraphOnChip';
import DetailedViewPipeRenderer from './DetailedViewPipeRenderer';
import type { LinkState } from '../../../data/StateTypes';

interface DetailedViewNOCRouterRendererProps {
    links: NetworkLink[];
    allLinksState: Record<string, LinkState>;
    nodeUid: string;
    label: string;
    className?: string;
}

const DetailedViewNOCRouterRenderer: React.FC<DetailedViewNOCRouterRendererProps> = ({
    links,
    allLinksState,
    nodeUid,
    label,
    className,
}) => {
    return (
        <>
            <div className='router'>
                <p className={`label ${className}`}>
                    {label}
                    <br />
                    Router
                </p>
            </div>
            <DetailedViewPipeRenderer links={links} allLinksState={allLinksState} nodeUid={nodeUid} />
        </>
    );
};

DetailedViewNOCRouterRenderer.defaultProps = {
    className: '',
};
export default DetailedViewNOCRouterRenderer;
