import React, { useState, useContext } from 'react';
import { Tab, TabId, Tabs } from '@blueprintjs/core';
import ComputeNodesPropertiesTab from './components/properties-panel/ComputeNodesPropertiesTab';
import OperationsPropertiesTab from './components/properties-panel/OperationsPropertiesTab';
import PipesPropertiesTab from './components/properties-panel/PipesPropertiesTab';
import DataSource, { GridContext } from '../data/DataSource';

export default function PropertiesPanel() {
    const [selectedTab, setSelectedTab] = useState<TabId>('tab1');
    const { chip } = useContext<GridContext>(DataSource);
    return (
        <div className='properties-panel'>
            <Tabs id='my-tabs' selectedTabId={selectedTab} onChange={setSelectedTab} className='properties-tabs'>
                <Tab id='tab1' title='Compute Node' panel={<ComputeNodesPropertiesTab />} />
                {/* TODO: abstract this into a global state */}
                {chip?.pipes.size > 0 && (
                    //
                    <Tab id='tab2' title='All pipes' panel={<PipesPropertiesTab />} />
                )}
                <Tab id='tab3' title='Operations' panel={<OperationsPropertiesTab />} />
            </Tabs>
        </div>
    );
}
