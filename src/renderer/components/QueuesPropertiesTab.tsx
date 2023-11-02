import React, { useContext, useMemo, useState } from 'react';
import DataSource from '../../data/DataSource';
import SearchField from './SearchField';
import FilterableComponent from './FilterableComponent';
import GraphNodeDetails from './GraphNodeDetails';
import HighlightedText from './HighlightedText';
import ExpandableGroup from './ExpandableGroup';

function QueuesPropertiesTab() {
    const { chip } = useContext(DataSource);

    const [filterQuery, setFilterQuery] = useState<string>('');

    const queuesList = useMemo(() => (chip ? [...chip.queues] : []), [chip]);

    return (
        <div>
            <SearchField searchQuery={filterQuery} onQueryChanged={setFilterQuery} />
            <div className='operations-wrap list-wrap'>
                <div className='scrollable-content'>
                    <ExpandableGroup
                        items={queuesList.map((queue) => [
                            queue.name,
                            <FilterableComponent
                                key={queue.name}
                                filterableString={queue.name}
                                filterQuery={filterQuery}
                                component={<HighlightedText text={queue.name} filter={filterQuery} />}
                            />,
                            queue && <GraphNodeDetails graphNode={queue} />,
                        ])}
                        itemClassName=''
                    />
                </div>
            </div>
        </div>
    );
}

export default QueuesPropertiesTab;
