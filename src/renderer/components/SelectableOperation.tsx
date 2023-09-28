import React, { ChangeEvent, FC } from 'react';
import { Checkbox } from '@blueprintjs/core';
import HighlightedText from './HighlightedText';
import { getGroupColor } from '../../data/ColorGenerator';

interface SelectableOperationProps {
    opName: string;
    value: boolean;
    selectFunc: (operation: string, checked: boolean) => void;
    stringFilter: string;
}

const SelectableOperation: FC<SelectableOperationProps> = ({ opName, selectFunc, value, stringFilter }) => {
    return (
        <div className='op-element'>
            <Checkbox
                checked={value}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    selectFunc(opName, e.target.checked);
                }}
            />
            <HighlightedText text={opName} filter={stringFilter} />
            <span
                className={`color-swatch ${value ? '' : 'transparent'}`}
                style={{ backgroundColor: getGroupColor(opName) }}
            />
        </div>
    );
};
export default SelectableOperation;
