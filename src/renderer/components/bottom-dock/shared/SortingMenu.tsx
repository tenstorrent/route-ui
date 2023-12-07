import { Menu, MenuItem } from '@blueprintjs/core';
import React from 'react';
import { SortingDirection } from '../useOperationsTable.hooks';

type SortingMenuProps = {
    sortFunction: (direction: SortingDirection) => void;
};

function SortingMenu({ sortFunction }: SortingMenuProps) {
    return (
        <Menu>
            <MenuItem icon='sort-asc' text='Sort Asc' onClick={() => sortFunction('asc')} />
            <MenuItem icon='sort-desc' text='Sort Desc' onClick={() => sortFunction('desc')} />
        </Menu>
    );
}

export default SortingMenu;