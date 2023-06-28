import React, {FC, useState} from 'react';
import {ItemRenderer, ItemPredicate, Suggest2} from '@blueprintjs/select';
import {MenuItem, Button, Checkbox} from '@blueprintjs/core';
import {IconNames} from '@blueprintjs/icons';
import {Pipe} from '../../data/DataStructures';

interface TypeaheadProps {
    items: Pipe[];
    selected: Pipe | null;
    setSelected: (item: Pipe | null) => void;
}

const renderItem: ItemRenderer<Pipe> = (item, {handleClick, modifiers}) => {
    if (!modifiers.matchesPredicate) {
        return null;
    }
    const text = `${item.id}`;
    return <MenuItem active={modifiers.active} disabled={modifiers.disabled} label={item.id} key={item.id} onClick={handleClick} />;
};

const filterByTypedInput: ItemPredicate<Pipe> = (query, item) => {
    return item.id.toLowerCase().indexOf(query.toLowerCase()) >= 0;
};

const Typeahead: FC<TypeaheadProps> = ({items, selected, setSelected}) => {
    const handleValueChange = (item: Pipe | null) => {
        setSelected(item);
    };
    const [query, setQuery] = useState<string>('');

    const clearInput = () => {
        setSelected(null);
        setQuery('');
    };

    return (
        <div className="search-field">
            <Suggest2<Pipe>
                items={items}
                itemRenderer={renderItem}
                onItemSelect={handleValueChange}
                itemPredicate={filterByTypedInput}
                inputValueRenderer={(item) => (item ? item.id : '')}
                onQueryChange={setQuery}
                query={query}
                selectedItem={selected}
                noResults={<MenuItem disabled text="No results." />}
            >
                <Button text={selected ? selected.id : '(No selection)'} rightIcon="double-caret-vertical" />
            </Suggest2>
            <Button text="" icon={IconNames.CROSS} onClick={clearInput} />
        </div>
    );
};

// TEMP component may be used ina  future
export default Typeahead;
