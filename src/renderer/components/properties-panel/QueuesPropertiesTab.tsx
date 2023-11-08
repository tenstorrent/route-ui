import React, { useContext, useMemo, useState } from 'react';
import { Button } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import DataSource from '../../../data/DataSource';
import SearchField from '../SearchField';
import FilterableComponent from '../FilterableComponent';
import GraphVertexDetails from '../GraphVertexDetails';
import HighlightedText from '../HighlightedText';
import Collapsible from '../Collapsible';

function QueuesPropertiesTab() {
    const { chip } = useContext(DataSource);
    const [allOpen, setAllOpen] = useState(true);
    const [filterQuery, setFilterQuery] = useState<string>('');

    const queuesList = useMemo(() => (chip ? [...chip.queues] : []), [chip]);

    return (
        <div>
            <SearchField searchQuery={filterQuery} onQueryChanged={setFilterQuery} controls={[]} />
            <Button onClick={() => setAllOpen(true)} minimal rightIcon={IconNames.DOUBLE_CHEVRON_DOWN} />
            <Button onClick={() => setAllOpen(false)} minimal rightIcon={IconNames.DOUBLE_CHEVRON_UP} />
            <div className='operations-wrap list-wrap'>
                <div className='scrollable-content'>
                    {queuesList.map((queue) => (
                        <FilterableComponent
                            key={queue.name}
                            filterableString={queue.name}
                            filterQuery={filterQuery}
                            component={
                                <Collapsible
                                    key={queue.name}
                                    content={queue && <GraphVertexDetails graphNode={queue} />}
                                    label={<HighlightedText text={queue.name} filter={filterQuery} />}
                                    open={allOpen}
                                    styles={{ color: '#000' }}
                                />
                            }
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default QueuesPropertiesTab;
