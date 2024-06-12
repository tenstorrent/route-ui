// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent Inc.

import { FC } from 'react';
import { useSelector } from 'react-redux';
import { ComputeNode } from '../../../data/GraphOnChip';
import { ComputeNodeType } from '../../../data/Types';
import { getOperationPerformanceTreshold } from '../../../data/store/selectors/operationPerf.selectors';
import { calculateOpCongestionColor, toRGBA } from '../../../utils/DrawingAPI';

const OperationCongestionLayer: FC<{ node: ComputeNode; isHighContrast: boolean; shouldRender: boolean }> = ({
    node,
    isHighContrast,
    shouldRender,
}) => {
    const threshold = useSelector(getOperationPerformanceTreshold);

    const opFactor = node.perfAnalyzerResults?.bw_limited_factor || 1;
    const isCoreNode = node.type === ComputeNodeType.CORE && node.opName !== '';
    let congestionColor = 'transparent';
    let opFactorLabel = '';

    if (shouldRender && isCoreNode && opFactor > threshold) {
        congestionColor = toRGBA(calculateOpCongestionColor(opFactor, 0, isHighContrast), 0.5);
        opFactorLabel = opFactor.toString();
    }

    return (
        <div className='operation-congestion' style={{ backgroundColor: congestionColor }}>
            {opFactorLabel}
        </div>
    );
};

export default OperationCongestionLayer;
