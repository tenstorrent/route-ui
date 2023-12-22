import React, { useContext, useState } from 'react';
import { Icon, Tab, TabId, Tabs } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import ComputeNodesPropertiesTab from './components/properties-panel/ComputeNodesPropertiesTab';
import OperationsPropertiesTab from './components/properties-panel/OperationsPropertiesTab';
import PipesPropertiesTab from './components/properties-panel/PipesPropertiesTab';
import DataSource, { GridContext } from '../data/DataSource';
import QueuesPropertiesTab from './components/properties-panel/QueuesPropertiesTab';
import QueueIcon from '../main/assets/QueueIcon';

export default function PropertiesPanel() {
    const [selectedTab, setSelectedTab] = useState<TabId>('tab-nodes');
    const { chip } = useContext<GridContext>(DataSource);
    return (
        <div className='properties-panel'>
            <Tabs id='my-tabs' selectedTabId={selectedTab} onChange={setSelectedTab} className='properties-tabs'>
                <Tab id='tab-nodes' title='Nodes' panel={<ComputeNodesPropertiesTab />} />
                {chip?.hasPipes && (
                    <Tab
                        id='tab-pipes'
                        title={
                            <span>
                                Pipes <Icon icon={IconNames.FILTER} />
                            </span>
                        }
                        panel={<PipesPropertiesTab />}
                    />
                )}
                {chip?.hasOperations && (
                    <Tab
                        id='tab-ops'
                        title={
                            <span>
                                Operations <Icon icon={IconNames.CUBE} />
                            </span>
                        }
                        panel={<OperationsPropertiesTab />}
                    />
                )}
                {chip?.hasQueues && (
                    <Tab
                        id='tab-queues'
                        title={
                            <span>
                                Queues <QueueIcon />{' '}
                            </span>
                        }
                        panel={<QueuesPropertiesTab />}
                    />
                )}
            </Tabs>
        </div>
    );
}
