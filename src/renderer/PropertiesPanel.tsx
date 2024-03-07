import { Icon, Tab, TabId, Tabs } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { useContext, useState } from 'react';
import { ChipContext } from '../data/ChipDataProvider';
import QueueIcon from '../main/assets/QueueIcon';
import ComputeNodesPropertiesTab from './components/properties-panel/ComputeNodesPropertiesTab';
import OperationsPropertiesTab from './components/properties-panel/OperationsPropertiesTab';
import PipesPropertiesTab from './components/properties-panel/PipesPropertiesTab';
import QueuesPropertiesTab from './components/properties-panel/QueuesPropertiesTab';

import './scss/PropertiesPanel.scss';

export default function PropertiesPanel() {
    const [selectedTab, setSelectedTab] = useState<TabId>('tab-nodes');
    const chip = useContext(ChipContext).getActiveChip();
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
