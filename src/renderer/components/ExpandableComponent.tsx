import React, { useState } from 'react';
import { Button, Icon } from '@blueprintjs/core';
import '../scss/ExpandableComponent.scss';

function ExpandableComponent(props: {
    expandedContent: React.JSX.Element;
    children: React.ReactNode;
}) {
    const { expandedContent, children } = props;
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className='expandable'>
            <Button minimal onClick={(_e) => setIsExpanded(!isExpanded)}>
                <div className='expandable-target'>
                    <Icon icon={isExpanded ? 'caret-down' : 'caret-right'} />
                    {children}
                </div>
            </Button>
            <div className='expandable-content'>{isExpanded && expandedContent}</div>
        </div>
    );
}

export default ExpandableComponent;
