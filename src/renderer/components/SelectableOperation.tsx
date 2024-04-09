// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent Inc.

import { Checkbox, Icon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React, { ChangeEvent, FC } from 'react';
import { useSelector } from 'react-redux';
import { getGroupColor } from '../../data/ColorGenerator';
import { GraphVertexType } from '../../data/GraphNames';
import { Operation } from '../../data/GraphTypes';
import {
    getOperationPerformanceTreshold,
    getShowOperationPerformanceGrid,
} from '../../data/store/selectors/operationPerf.selectors';
import { getHighContrastState } from '../../data/store/selectors/uiState.selectors';
import QueueIcon from '../../main/assets/QueueIcon';
import { calculateOpCongestionColor } from '../../utils/DrawingAPI';
import ColorSwatch from './ColorSwatch';
import HighlightedText from './HighlightedText';
import './SelectableOperation.scss';

interface SelectableOperationProps {
    opName: string;
    value: boolean;
    selectFunc: (operation: string, checked: boolean) => void;
    stringFilter: string;
    type?: GraphVertexType | null;
    disabled?: boolean;
}

/**
 * @description A selectable operation component that is really a selectable GraphVertex.
 */
const SelectableOperation: FC<SelectableOperationProps> = ({
    opName,
    selectFunc,
    value,
    stringFilter,
    type = null,
    disabled = false,
}) => {
    return (
        <div className='op-element'>
            <Checkbox
                disabled={disabled}
                checked={value}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    selectFunc(opName, e.target.checked);
                }}
            />
            {type !== null && (
                <span className={`op-type icon ${type}`}>
                    {type === GraphVertexType.OPERATION && <Icon icon={IconNames.CUBE} />}
                    {type === GraphVertexType.QUEUE && <QueueIcon />}
                </span>
            )}
            <HighlightedText text={opName} filter={stringFilter} />
            <ColorSwatch isVisible color={getGroupColor(opName)} />
        </div>
    );
};

SelectableOperation.defaultProps = {
    type: null,
    disabled: false,
};
export default SelectableOperation;

interface SelectableOperationPerformanceProps {
    operation: Operation | null;
    children: React.ReactElement<typeof SelectableOperation>;
}

export const SelectableOperationPerformance: FC<SelectableOperationPerformanceProps> = ({ operation, children }) => {
    const render = useSelector(getShowOperationPerformanceGrid);
    const threshold = useSelector(getOperationPerformanceTreshold);
    const isHighContrast: boolean = useSelector(getHighContrastState);
    if (!render || !operation || !operation.details) {
        return children;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let operandType: GraphVertexType | null;
    React.Children.forEach(children, (child) => {
        if (React.isValidElement<SelectableOperationProps>(child)) {
            operandType = child.props.type || null;
        }
    });

    // TODO: we will use operandType in the next iterration to address the type of styling we render as queue custom icon requires stroke and not color/fill
    const opFactor = operation.details?.bw_limited_factor || 1;
    if (opFactor > threshold) {
        const congestionColor = calculateOpCongestionColor(opFactor, 0, isHighContrast);

        return (
            <div
                className='op-performance-indicator'
                style={{
                    color: `${congestionColor}`,
                }}
            >
                {children}
            </div>
        );
    }
    return children;
};
