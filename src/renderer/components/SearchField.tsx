import React from 'react';
import { Button, Icon, InputGroup } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';

interface SearchFieldProps {
    searchQuery: string;
    onQueryChanged: (query: string) => void;
    controls: React.ReactElement[];
    disabled?: boolean;
}

/**
 * Renders a search field. Controlled component.
 */
function SearchField({ searchQuery, onQueryChanged, controls, disabled }: SearchFieldProps): React.ReactElement {
    return (
        <div className='search-field'>
            <InputGroup
                disabled={disabled}
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

SearchField.defaultProps = {
    disabled : false
}

export default SearchField;
