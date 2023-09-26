import React from 'react';

import {Menu, MenuItem} from '@blueprintjs/core';

interface GraphPickerProps {
    options: string[];
    selected: string | null;
    onSelect: (graphId: string) => void;
}

const GraphPicker = ({options, selected, onSelect}: GraphPickerProps): React.ReactElement => {
    return (
        <div className="graph-picker">
            <h3>Select a graph</h3>
            <Menu>
                {options.map((item) => (
                    <MenuItem key={item} selected={selected === item} onClick={(_e) => onSelect(item)} text={item} />
                ))}
            </Menu>
        </div>
    );
};

export default GraphPicker;
