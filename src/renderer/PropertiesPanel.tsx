import React, { useContext, useMemo, useState } from 'react';
import { Tab, TabId, Tabs } from '@blueprintjs/core';
import ComputeNodesPropertiesTab from './components/properties-panel/ComputeNodesPropertiesTab';
import OperationsPropertiesTab from './components/properties-panel/OperationsPropertiesTab';
import PipesPropertiesTab from './components/properties-panel/PipesPropertiesTab';
import DataSource, { GridContext } from '../data/DataSource';
import FilterableComponent from './components/FilterableComponent';
import HighlightedText from './components/HighlightedText';
import ExpandableComponent from './components/ExpandableComponent';
import SearchField from "./components/SearchField";
import GraphNodeDetails from "./components/GraphNodeDetails";

function QueuesPropertiesTab() {
    const { chip } = useContext(DataSource);

    const [filterQuery, setFilterQuery] = useState<string>('');

    const queuesList = useMemo(() => (chip ? [...chip.queues] : []), [chip]);

    return (
        <div>
            <SearchField searchQuery={filterQuery} onQueryChanged={setFilterQuery} />
            <div className='operations-wrap list-wrap'>
                <div className='scrollable-content'>
                    {queuesList.map((queue) => {
                        return (
                            <FilterableComponent
                                key={queue.name}
                                filterableString={queue.name}
                                filterQuery={filterQuery}
                                component={
                                    <div className='op-element'>
                                        <ExpandableComponent
                                            expandedContent={queue && <GraphNodeDetails graphNode={queue} />}
                                        >
                                            <HighlightedText text={queue.name} filter={filterQuery} />
                                        </ExpandableComponent>
                                    </div>
                                }
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default function PropertiesPanel() {
    const [selectedTab, setSelectedTab] = useState<TabId>('tab-nodes');
    const { chip } = useContext<GridContext>(DataSource);
    return (
        <div className='properties-panel'>
            <Tabs id='my-tabs' selectedTabId={selectedTab} onChange={setSelectedTab} className='properties-tabs'>
                <Tab id='tab-nodes' title='Compute Node' panel={<ComputeNodesPropertiesTab />} />
                {/* TODO: abstract this into a global state */}
                {chip && chip.pipes.size > 0 && (
                    //
                    <Tab id='tab-pipes' title='All pipes' panel={<PipesPropertiesTab />} />
                )}
                <Tab id='tab-ops' title='Operations' panel={<OperationsPropertiesTab />} />

                {process.env.NODE_ENV === 'development' && (
                    <Tab id='tab-queues' title='Queues' panel={<QueuesPropertiesTab />} />
                )}
            </Tabs>
        </div>
    );
}
