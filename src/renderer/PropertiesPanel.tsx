import React, { useState } from 'react';
import { Tab, TabId, Tabs } from '@blueprintjs/core';
import ComputeNodesPropertiesTab from './components/properties-panel/ComputeNodesPropertiesTab';
import OperationsPropertiesTab from './components/properties-panel/OperationsPropertiesTab';
import PipesPropertiesTab from './components/properties-panel/PipesPropertiesTab';

export default function PropertiesPanel() {
    const [selectedTab, setSelectedTab] = useState<TabId>('tab1');

    return (
        <div className='properties-panel'>
            <Tabs id='my-tabs' selectedTabId={selectedTab} onChange={setSelectedTab} className='properties-tabs'>
                <Tab id='tab1' title='Compute Node' panel={<ComputeNodesPropertiesTab />} />

                <Tab id='tab2' title='All pipes' panel={<PipesPropertiesTab />} />

                <Tab id='tab3' title='Operations' panel={<OperationsPropertiesTab />} />
            </Tabs>
        </div>
    );
}
