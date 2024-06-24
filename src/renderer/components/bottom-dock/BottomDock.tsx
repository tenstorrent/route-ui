// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent Inc.

import { Button, Classes, Tab, TabId, Tabs } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { toggleDockOpenState } from 'data/store/slices/uiState.slice';
import { type FC, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getLogOutputEnabled } from '../../../data/store/selectors/logging.selector';
import LogsOutput from '../LogsOutput';
import OperationsTable from './OperationsTable';
import QueuesTable from './QueuesTable';

import './BottomDock.scss';
import { getDockOpenState } from '../../../data/store/selectors/uiState.selectors';

interface BottomDockProps {}

const BottomDock: FC<BottomDockProps> = () => {
    const [selectedTab, setSelectedTab] = useState<TabId>('tab1');
    const dispatch = useDispatch();

    const isLogOutputEnabled = useSelector(getLogOutputEnabled);
    const isDockOpen = useSelector(getDockOpenState);

    return (
        <div className={`dock bottom-dock ${isDockOpen ? 'dock-open' : ''}`}>
            {isDockOpen && (
                <>
                    <Tabs
                        key={isDockOpen ? 'active-dock-tabs-key' : 'inactive-dock-tabs-key'}
                        id='dock-tabs'
                        selectedTabId={selectedTab}
                        onChange={setSelectedTab}
                        className={Classes.TABS}
                        renderActiveTabPanelOnly
                    >
                        <Tab id='tab1' title='Operations' panel={<OperationsTable />} />
                        <Tab id='tab2' title='Queues' panel={<QueuesTable />} />
                        {isLogOutputEnabled && <Tab id='tab3' title='Logs' panel={<LogsOutput />} />}
                    </Tabs>
                    <Button
                        minimal
                        icon={IconNames.CROSS}
                        className='dock-close-button'
                        onClick={() => dispatch(toggleDockOpenState())}
                    />
                </>
            )}
        </div>
    );
};

export default BottomDock;
