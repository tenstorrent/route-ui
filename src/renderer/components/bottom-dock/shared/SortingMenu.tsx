import { Menu, MenuItem } from '@blueprintjs/core';
import React from 'react';

import { SortingDirection } from '../useCommonTable.hook';

type SortingMenuProps = {
    sortFunction: (direction: SortingDirection) => void;
};

function SortingMenu({ sortFunction }: SortingMenuProps) {
    return (
        <Menu>
            <MenuItem icon='sort-asc' text='Sort Asc' onClick={() => sortFunction(SortingDirection.ASC)} />
            <MenuItem icon='sort-desc' text='Sort Desc' onClick={() => sortFunction(SortingDirection.DESC)} />
        </Menu>
    );
}

export default SortingMenu;
