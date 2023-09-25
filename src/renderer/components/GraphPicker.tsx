import React from 'react';

import {MenuItem} from '@blueprintjs/core';
import {ItemRenderer, Select2} from '@blueprintjs/select';

interface GraphPickerProps {
    options: string[];
    selected: string | null;
    onSelect: (graphId: string) => void;
}
const graphItemRenderer: ItemRenderer<string> = (item, {handleClick, handleFocus, modifiers}) => (
    <MenuItem active={modifiers.active} key={item} onClick={handleClick} onFocus={handleFocus} />
);

const GraphPicker = ({options, selected, onSelect}: GraphPickerProps): React.ReactElement => {
    const [epoch, setEpoch] = React.useState(0);
    return (
        <div>
            <input type="number" value={epoch} onChange={(e) => setEpoch(Number(e.target.value))} />
            <Select2 items={options} itemRenderer={graphItemRenderer} noResults={<MenuItem disabled text="No results" roleStructure="listoption" />} onItemSelect={onSelect} />
        </div>
    );
};

export default GraphPicker;
