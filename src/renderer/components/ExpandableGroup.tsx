import React, { useReducer } from 'react';
import { Tooltip2 } from '@blueprintjs/popover2';
import { Button, Icon } from '@blueprintjs/core';

interface ExpandableGroupProps {
    items: Array<[key: string, item: React.ReactElement<ExpandableGroupProps>, expandedContent: React.ReactNode]>;
    // eslint-disable-next-line react/require-default-props
    itemClassName?: string;
}

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

const ExpandableGroup: React.FC<ExpandableGroupProps> = ({
    items,
    itemClassName,
}: ExpandableGroupProps): React.ReactElement => {
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
        items.forEach(([key]) => {
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
                {items.map(([key, item, content]) => (
                    <ExpandableComponent
                        target={item}
                        targetClassName={itemClassName || ''}
                        expandedContent={content}
                        isExpanded={expansion.expanded.has(key)}
                        onExpandedChange={(isExpanded) => expansionDispatch([key, isExpanded])}
                        key={key}
                    />
                ))}
            </div>
        </>
    );
};

export default ExpandableGroup;
