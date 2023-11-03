import React from 'react';
import { Button, Icon, InputGroup } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';

interface SearchFieldProps {
    searchQuery: string;
    onQueryChanged: (query: string) => void;
    controls: React.ReactElement[];
}

/**
 * Renders a search field. Controlled component.
 */
function SearchField({ searchQuery, onQueryChanged, controls }: SearchFieldProps): React.ReactElement {
    return (
        <div className='search-field'>
            <InputGroup
                rightElement={
                    searchQuery ? (
                        <Button
                            minimal
                            onClick={() => {
                                onQueryChanged('');
                            }}
                            icon={IconNames.CROSS}
                        />
                    ) : (
                        <Icon icon={IconNames.SEARCH} />
                    )
                }
                placeholder=''
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onQueryChanged(e.target.value)}
            />
            {controls}
        </div>
    );
}

export default SearchField;
