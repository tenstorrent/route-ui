import React, { ChangeEvent, FC } from 'react';
import { Checkbox, Icon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import HighlightedText from './HighlightedText';
import { getGroupColor } from '../../data/ColorGenerator';
import { GraphVertexType } from '../../data/GraphTypes';
import QueueIcon from '../../main/assets/QueueIcon';

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
    type= null,
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
