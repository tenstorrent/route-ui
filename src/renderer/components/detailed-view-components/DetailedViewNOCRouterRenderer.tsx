// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent AI ULC

import React from 'react';
import { NetworkLink } from '../../../data/GraphOnChip';
import DetailedViewPipeRenderer from './DetailedViewPipeRenderer';

interface DetailedViewNOCRouterRendererProps {
    links: NetworkLink[];
    temporalEpoch: number;
    chipId?: number;
    label: string;
    className?: string;
}

const DetailedViewNOCRouterRenderer: React.FC<DetailedViewNOCRouterRendererProps> = ({
    links,
    temporalEpoch,
    chipId,
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
            <DetailedViewPipeRenderer links={links} temporalEpoch={temporalEpoch} chipId={chipId} />
        </>
    );
};

DetailedViewNOCRouterRenderer.defaultProps = {
    chipId: undefined,
    className: '',
};
export default DetailedViewNOCRouterRenderer;
