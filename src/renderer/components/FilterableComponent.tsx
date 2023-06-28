import {FC, ReactNode} from 'react';

interface FilterableComponentProps {
    text: string;
    filter: string;
    component: ReactNode;
}

const FilterableComponent: FC<FilterableComponentProps> = ({text, filter, component}) => {
    const index = text.toLowerCase().indexOf(filter.toLowerCase());
    if (index === -1 && filter !== '') {
        return null;
    }
    return component;
};

export default FilterableComponent;
