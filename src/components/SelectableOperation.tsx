// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent AI ULC

import { Button, Checkbox, Icon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React, { ChangeEvent, FC, type PropsWithChildren } from 'react';
import { useSelector } from 'react-redux';
import { getGroupColor } from '../data/ColorGenerator';
import { GraphVertexType } from '../data/GraphNames';
import { Operation } from '../data/GraphTypes';
import { getOperationPerformanceTreshold } from '../data/store/selectors/operationPerf.selectors';
import { getHighContrastState } from '../data/store/selectors/uiState.selectors';
import QueueIcon from '../assets/QueueIcon';
import { calculateOpCongestionColor } from '../utils/DrawingAPI';
import ColorSwatch from './ColorSwatch';
import HighlightedText from './HighlightedText';
import './SelectableOperation.scss';

interface SelectableOperationProps extends PropsWithChildren {
    opName: string;
    value: boolean;
    selectFunc: (operation: string, checked: boolean) => void;
    stringFilter: string;
    type?: GraphVertexType | null;
    disabled?: boolean;
    offchip?: boolean;
    offchipClickHandler?: () => void;
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
    offchip = false,
    offchipClickHandler,
    children,
}) => {
    return (
        <div className={`op-element ${offchip ? 'has-offchip' : ''}`}>
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
            {offchip && (
                <Button
                    className='offchip-button'
                    title='Navigate to graph'
                    small
                    minimal
                    disabled={offchipClickHandler === undefined}
                    icon={IconNames.OPEN_APPLICATION}
                    onClick={() => offchipClickHandler?.()}
                />
            )}
            {children}
        </div>
    );
};

export default SelectableOperation;

interface SelectableOperationPerformanceProps {
    operation: Operation | null;
    children: React.ReactElement<typeof SelectableOperation>;
    shouldShowOpPerformance: boolean;
}

export const SelectableOperationPerformance: FC<SelectableOperationPerformanceProps> = ({
    operation,
    children,
    shouldShowOpPerformance,
}) => {
    const threshold = useSelector(getOperationPerformanceTreshold);
    const isHighContrast: boolean = useSelector(getHighContrastState);
    const shouldRenderColor = shouldShowOpPerformance && operation?.details != null;

    const opFactor = operation?.details?.bw_limited_factor || 1;
    let congestionColor = 'currentColor';

    if (shouldRenderColor && opFactor > threshold) {
        congestionColor = calculateOpCongestionColor(opFactor, 0, isHighContrast);
    }

    return (
        <div
            className='op-performance-indicator'
            style={{
                // @ts-expect-error
                '--js-congestion-color': `${congestionColor}`,
            }}
        >
            {children}
        </div>
    );
};
