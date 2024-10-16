// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent AI ULC

import { FC } from 'react';

import { getGroupColor } from '../../data/ColorGenerator';

const NodeOperationLabel: FC<{ opName: string; shouldRender: boolean }> = ({ opName, shouldRender }) => {
    let bgColor = 'transparent';

    if (shouldRender && opName !== '') {
        bgColor = getGroupColor(opName) ?? 'transparent';
    }

    return (
        <div
            className='node-layer op-label'
            style={{
                backgroundColor: bgColor,
                ...((!shouldRender || opName === '') && { display: 'none' }),
            }}
        >
            {opName}
        </div>
    );
};

export default NodeOperationLabel;
