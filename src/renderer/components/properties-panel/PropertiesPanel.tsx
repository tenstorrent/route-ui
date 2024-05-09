// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent Inc.

import { Icon, Tab, TabId, Tabs } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { useContext, useState } from 'react';
import { type Location, useLocation } from 'react-router-dom';
import { GraphOnChipContext } from '../../../data/GraphOnChipContext';
import QueueIcon from '../../../main/assets/QueueIcon';
import ComputeNodesPropertiesTab from './ComputeNodesPropertiesTab';
import OperationsPropertiesTab from './OperationsPropertiesTab';
import PipesPropertiesTab from './PipesPropertiesTab';
import QueuesPropertiesTab from './QueuesPropertiesTab';

import './PropertiesPanel.scss';
import type { LocationState } from '../../../data/StateTypes';

export default function PropertiesPanel() {
    const location: Location<LocationState> = useLocation();
    const { chipId = -1, epoch, graphName = '' } = location.state;
    const [selectedTab, setSelectedTab] = useState<TabId>('tab-nodes');
    const graphOnChip = useContext(GraphOnChipContext).getGraphOnChip(epoch, chipId);
    return (
        <div className='properties-panel'>
            <Tabs id='my-tabs' selectedTabId={selectedTab} onChange={setSelectedTab} className='properties-tabs'>
                <Tab
                    id='tab-nodes'
                    title='Nodes'
                    panel={<ComputeNodesPropertiesTab epoch={epoch} graphName={graphName} />}
                />
                {graphOnChip?.hasPipes && (
                    <Tab
                        id='tab-pipes'
                        title={
                            <span>
                                Pipes <Icon icon={IconNames.FILTER} />
                            </span>
                        }
                        panel={<PipesPropertiesTab epoch={epoch} chipId={chipId} />}
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
                        panel={<OperationsPropertiesTab chipId={chipId} epoch={epoch} />}
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
                        panel={<QueuesPropertiesTab chipId={chipId} epoch={epoch} />}
                    />
                )}
            </Tabs>
            <div className='panel-overlay' />
        </div>
    );
}
