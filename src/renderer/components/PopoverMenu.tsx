import React from "react";

import { Popover2 } from "@blueprintjs/popover2";
import { Button, Menu, MenuItem } from "@blueprintjs/core";

interface PopoverMenuProps {
    label: string;
    options: string[];
    selectedItem: string | null;
    onSelectItem: (graphName: string) => void;
    disabled: boolean;
}

const PopoverMenu = ({label, options, selectedItem, onSelectItem, disabled}: PopoverMenuProps): React.ReactElement => {
    return <Popover2
        content={
            <div className='popover-list-picker'>
                <h3>{label}</h3>
                <Menu>
                    {options.map((item) => (
                        <MenuItem
                            key={item}
                            selected={selectedItem === item}
                            onClick={(_e) => onSelectItem(item)}
                            text={item}
                        />
                    ))}
                </Menu>
            </div>
        }
        disabled={disabled}
        placement='right'
    >
        <Button icon="globe-network" disabled={disabled}>{label}</Button>
    </Popover2>
};

export default PopoverMenu;
