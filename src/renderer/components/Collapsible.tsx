// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent AI ULC.

import { Button, Collapse } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React, { useEffect } from 'react';
import { JSX } from 'react/jsx-runtime';

import './Collapsible.scss';

interface CollapsibleProps {
    label: string | JSX.Element;
    isOpen?: boolean;
    styles?: React.CSSProperties;
    contentStyles?: React.CSSProperties;
}

/**
 *
 * @param label Clickable label
 * @param isOpen state, initial state and action to change state
 * @param styles
 * @param children ReactNode
 * @constructor
 */
const Collapsible: React.FC<React.PropsWithChildren<CollapsibleProps>> = ({
    label,
    isOpen = true,
    styles = {},
    contentStyles = {},
    children,
}) => {
    const [isOpenState, setIsOpenState] = React.useState(isOpen);
    useEffect(() => {
        setIsOpenState(isOpen);
    }, [isOpen]);

    const icon = isOpenState ? IconNames.CARET_UP : IconNames.CARET_DOWN;
    return (
        <div className='collapsible-component' style={styles}>
            <Button small minimal onClick={() => setIsOpenState(!isOpenState)} rightIcon={icon}>
                {label}
            </Button>
            <Collapse isOpen={isOpenState} keepChildrenMounted>
                <div style={contentStyles}>{children}</div>
            </Collapse>
        </div>
    );
};

Collapsible.defaultProps = {
    contentStyles: {},
    styles: {},
    isOpen: true,
};
export default Collapsible;
