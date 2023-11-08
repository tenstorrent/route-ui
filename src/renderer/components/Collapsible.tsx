import React, { useEffect } from 'react';
import { Button, Collapse } from '@blueprintjs/core';
import { JSX } from 'react/jsx-runtime';
import { IconNames } from '@blueprintjs/icons';
import '../scss/Collapsible.scss';

interface CollapsibleProps {
    content: React.ReactElement | null;
    label: string | JSX.Element;
    isOpen?: boolean;
    styles?: React.CSSProperties;
}

const Collapsible: React.FC<CollapsibleProps> = ({ content, label, isOpen, styles }) => {
    const [isOpenState, setIsOpenState] = React.useState(isOpen);
    useEffect(() => {
        setIsOpenState(isOpen);
    }, [isOpen]);

    const icon = isOpenState ? IconNames.CARET_UP : IconNames.CARET_DOWN;

    return (
        <div className='collapsible-component'>
            <Button small minimal onClick={() => setIsOpenState(!isOpenState)} rightIcon={icon}>
                {label}
            </Button>
            <Collapse isOpen={isOpenState}>
                <div style={styles}>{content}</div>
            </Collapse>
        </div>
    );
};

Collapsible.defaultProps = {
    styles: {},
    isOpen: true,
};
export default Collapsible;
