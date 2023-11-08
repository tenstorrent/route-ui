import React, { useEffect } from 'react';
import { Button, Collapse } from '@blueprintjs/core';
import { JSX } from 'react/jsx-runtime';
import { IconNames } from '@blueprintjs/icons';
import '../scss/Collapsible.scss';

interface CollapsibleProps {
    content: React.ReactElement | null;
    label: string | JSX.Element;
    open: boolean;
    styles?: React.CSSProperties;
}

const Collapsible: React.FC<CollapsibleProps> = ({ content, label, open, styles }) => {
    const [isOpen, setIsOpen] = React.useState(open);
    useEffect(() => {
        setIsOpen(open);
    }, [open]);


    const icon = isOpen ? IconNames.CARET_UP : IconNames.CARET_DOWN;

    return (
        <div className='collapsible-component'>
            <Button small minimal onClick={()=>setIsOpen(!isOpen)} rightIcon={icon}>
                {label}
            </Button>
            <Collapse isOpen={isOpen}>
                <div style={styles}>{content}</div>
            </Collapse>
        </div>
    );
};

Collapsible.defaultProps = {
    styles: {},
};
export default Collapsible;
