import React, { useEffect } from 'react';
import { Button, Collapse } from '@blueprintjs/core';
import { JSX } from 'react/jsx-runtime';
import { IconNames } from '@blueprintjs/icons';
import '../scss/Collapsible.scss';

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
    isOpen=true,
    styles= {},
    contentStyles= {},
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
