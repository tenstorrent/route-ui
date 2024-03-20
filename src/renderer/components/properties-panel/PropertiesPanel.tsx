import { Icon, Tab, TabId, Tabs } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { useContext, useState } from 'react';
import { GraphOnChipContext } from '../../../data/GraphOnChipDataProvider';
import QueueIcon from '../../../main/assets/QueueIcon';
import ComputeNodesPropertiesTab from './ComputeNodesPropertiesTab';
import OperationsPropertiesTab from './OperationsPropertiesTab';
import PipesPropertiesTab from './PipesPropertiesTab';
import QueuesPropertiesTab from './QueuesPropertiesTab';

import './PropertiesPanel.scss';

export default function PropertiesPanel() {
    const [selectedTab, setSelectedTab] = useState<TabId>('tab-nodes');
    const graphOnChip = useContext(GraphOnChipContext).getActiveChip();
    return (
        <div className='properties-panel'>
            <Tabs id='my-tabs' selectedTabId={selectedTab} onChange={setSelectedTab} className='properties-tabs'>
                <Tab id='tab-nodes' title='Nodes' panel={<ComputeNodesPropertiesTab />} />
                {graphOnChip?.hasPipes && (
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
                {graphOnChip?.hasOperations && (
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
                {graphOnChip?.hasQueues && (
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
