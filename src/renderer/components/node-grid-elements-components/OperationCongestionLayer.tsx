/**
 * SPDX-License-Identifier: Apache-2.0
 * SPDX-FileCopyrightText: © 2024 Tenstorrent Inc.
 */

import { FC } from 'react';
import { useSelector } from 'react-redux';
import { ComputeNode } from '../../../data/GraphOnChip';
import { ComputeNodeType } from '../../../data/Types';
import {
    getOperationPerformanceTreshold,
    getShowOperationPerformanceGrid,
} from '../../../data/store/selectors/operationPerf.selectors';
import { getHighContrastState } from '../../../data/store/selectors/uiState.selectors';
import { calculateOpCongestionColor, toRGBA } from '../../../utils/DrawingAPI';

const OperationCongestionLayer: FC<{ node: ComputeNode }> = ({ node }) => {
    const render = useSelector(getShowOperationPerformanceGrid);
    const threshold = useSelector(getOperationPerformanceTreshold);
    const isHighContrast: boolean = useSelector(getHighContrastState);

    if (!render) {
        return null;
    }

    if (node.type !== ComputeNodeType.CORE || node.opName === '') {
        return null;
    }

    const opFactor = node.perfAnalyzerResults?.bw_limited_factor || 1;

    if (opFactor > threshold) {
        const congestionColor = toRGBA(calculateOpCongestionColor(opFactor, 0, isHighContrast), 0.5);
        return (
            <div className='operation-congestion' style={{ backgroundColor: congestionColor }}>
                {opFactor}
            </div>
        );
    }
    return <div className='operation-congestion' />;
};

export default OperationCongestionLayer;
