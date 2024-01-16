import React, { ChangeEvent, FC } from 'react';
import { Checkbox, Icon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { useSelector } from 'react-redux';
import HighlightedText from './HighlightedText';
import { getGroupColor } from '../../data/ColorGenerator';
import QueueIcon from '../../main/assets/QueueIcon';
import { GraphVertexType } from '../../data/GraphNames';
import { RootState } from '../../data/store/createStore';
import {
    getOperationPerformanceTreshold,
    getShowOperationPerformanceGrid,
} from '../../data/store/selectors/operationPerf.selectors';
import { getHighContrastState } from '../../data/store/selectors/uiState.selectors';
import { Operation } from '../../data/GraphTypes';
import { calculateOpCongestionColor } from '../../utils/DrawingAPI';

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
            <span
                className={`color-swatch ${value ? '' : 'transparent'}`}
                style={{ backgroundColor: getGroupColor(opName) }}
            />
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
    children: React.ReactNode;
}

export const SelectableOperationPerformance: FC<SelectableOperationPerformanceProps> = ({ operation, children }) => {
    const render = useSelector((state: RootState) => getShowOperationPerformanceGrid(state));
    const threshold = useSelector((state: RootState) => getOperationPerformanceTreshold(state));
    const isHighContrast: boolean = useSelector(getHighContrastState);
    if (!render || !operation || !operation.details) {
        return children;
    }

    const opFactor = operation.details?.bw_limited_factor || 1;
    if (opFactor > threshold) {
        const congestionColor = calculateOpCongestionColor(opFactor, 0, isHighContrast);
        return (
            <div
                style={{
                    display: 'flex',
                    color: `${congestionColor}`,
                }}
            >
                {children}
            </div>
        );
    }
    return children ;
};
