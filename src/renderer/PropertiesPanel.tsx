import React, { useContext, useMemo, useState } from 'react';
import { Tab, TabId, Tabs } from '@blueprintjs/core';
import ComputeNodesPropertiesTab from './components/properties-panel/ComputeNodesPropertiesTab';
import OperationsPropertiesTab from './components/properties-panel/OperationsPropertiesTab';
import PipesPropertiesTab from './components/properties-panel/PipesPropertiesTab';
import DataSource, { GridContext } from '../data/DataSource';

function QueuesPropertiesTab() {
    const { chip } = useContext(DataSource);
    const queuesList = useMemo(() => (chip ? [...chip.queues] : []), [chip]);

    return (
        <div className='queues-wrap list-wrap'>
            <div className='scrollable-content'>
                {queuesList.map((queue) => {
                    return <div>{queue.name}</div>;
                })}
            </div>
        </div>
    );
}

export default function PropertiesPanel() {
    const [selectedTab, setSelectedTab] = useState<TabId>('tab1');
    const { chip } = useContext<GridContext>(DataSource);
    return (
        <div className='properties-panel'>
            <Tabs id='my-tabs' selectedTabId={selectedTab} onChange={setSelectedTab} className='properties-tabs'>
                <Tab id='tab1' title='Compute Node' panel={<ComputeNodesPropertiesTab />} />
                {/* TODO: abstract this into a global state */}
                {chip && chip.pipes.size > 0 && (
                    //
                    <Tab id='tab2' title='All pipes' panel={<PipesPropertiesTab />} />
                )}
                <Tab id='tab3' title='Operations' panel={<OperationsPropertiesTab />} />

                {process.env.NODE_ENV === 'development' && (
                    <Tab id='tab4' title='Queues' panel={<QueuesPropertiesTab />} />
                )}
            </Tabs>
        </div>
    );
}
