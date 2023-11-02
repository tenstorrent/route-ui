import React, { useContext, useState } from 'react';
import { Tab, TabId, Tabs } from '@blueprintjs/core';
import ComputeNodesPropertiesTab from './components/properties-panel/ComputeNodesPropertiesTab';
import OperationsPropertiesTab from './components/properties-panel/OperationsPropertiesTab';
import PipesPropertiesTab from './components/properties-panel/PipesPropertiesTab';
import DataSource, { GridContext } from '../data/DataSource';
import QueuesPropertiesTab from './components/QueuesPropertiesTab';

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
