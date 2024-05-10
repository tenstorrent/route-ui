// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent AI ULC.

import { Button, Icon } from '@blueprintjs/core';
import { Tooltip2 } from '@blueprintjs/popover2';
import React, { useReducer } from 'react';

/**
 * Renders a target element within a clickable button, which toggles the visibility of the expanded content.
 *
 * `targetClassName` will be added to the `div` element that contains the button and expanded content.
 *
 */
function ExpandableComponent(props: {
    expandedContent: React.ReactNode;
    targetClassName: string;
    isExpanded: boolean;
    onExpandedChange: (isExpanded: boolean) => void;
    target: React.ReactElement;
}) {
    const { expandedContent, isExpanded, onExpandedChange, target, targetClassName } = props;

    return (
        <div className={`expandable ${targetClassName}`}>
            <Button minimal onClick={(_e) => onExpandedChange(!isExpanded)}>
                <div className='expandable-target'>
                    {target}
                    <Icon icon={isExpanded ? 'caret-down' : 'caret-right'} />
                </div>
            </Button>
            <div className='expandable-content'>{isExpanded && expandedContent}</div>
        </div>
    );
}

interface ExpandableItem {
    key: string;
    target: React.ReactElement<ExpandableGroupProps>;
    expandedContent: React.ReactNode;
    className?: string;
}

interface ExpandableGroupProps {
    items: ExpandableItem[];
}

/** Renders a list of target items, which can each be expanded to display additional content. */
const ExpandableGroup: React.FC<ExpandableGroupProps> = ({ items }: ExpandableGroupProps): React.ReactElement => {
    interface ExpansionState {
        expanded: Set<string>;
    }

    const [expansion, expansionDispatch] = useReducer(
        (state: ExpansionState, action: [string, boolean]) => {
            if (action[1]) {
                state.expanded.add(action[0]);
            } else {
                state.expanded.delete(action[0]);
            }
            return { ...state };
        },
        { expanded: new Set<string>() },
    );

    const collapseAll = () => {
        expansion.expanded.forEach((_v, k) => {
            expansionDispatch([k, false]);
        });
    };

    const expandAll = () => {
        items.forEach(({ key }) => {
            expansionDispatch([key, true]);
        });
    };

    return (
        <>
            <div>
                <Tooltip2 content='Collapse All'>
                    <Button icon='collapse-all' onClick={(_e) => collapseAll()} />
                </Tooltip2>
                <Tooltip2 content='Expand All'>
                    <Button icon='expand-all' onClick={(_e) => expandAll()} />
                </Tooltip2>
            </div>
            <div>
                {items.map(({ key, target, expandedContent, className }) => (
                    <ExpandableComponent
                        key={key}
                        target={target}
                        targetClassName={className || ''}
                        expandedContent={expandedContent}
                        isExpanded={expansion.expanded.has(key)}
                        onExpandedChange={(isExpanded) => expansionDispatch([key, isExpanded])}
                    />
                ))}
            </div>
        </>
    );
};

export default ExpandableGroup;
