/**
 * SPDX-License-Identifier: Apache-2.0
 * SPDX-FileCopyrightText: © 2024 Tenstorrent Inc.
 */

import { Button, Classes, Tab, TabId, Tabs } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { setDockOpenState } from 'data/store/slices/uiState.slice';
import { useState, type FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getExperimentalFeatures } from '../../../data/store/selectors/experimentalFeatures.selectors';
import { getLogOutputEnabled } from '../../../data/store/selectors/logging.selector';
import LogsOutput from '../LogsOutput';
import OperationsTable from './OperationsTable';
import QueuesTable from './QueuesTable';

import './BottomDock.scss';

interface BottomDockProps {
    isActive: boolean;
}

const BottomDock: FC<BottomDockProps> = ({ isActive }) => {
    const [selectedTab, setSelectedTab] = useState<TabId>('tab1');
    const dispatch = useDispatch();

    const isLogOutputEnabled = useSelector(getLogOutputEnabled);
    const queuesTableEnabled = useSelector(getExperimentalFeatures('showQueuesTable'));

    return (
        <div className='dock bottom-dock'>
            <Tabs
                key={isActive ? 'active-dock-tabs-key' : 'inactive-dock-tabs-key'}
                id='dock-tabs'
                selectedTabId={selectedTab}
                onChange={setSelectedTab}
                className={Classes.TABS}
                renderActiveTabPanelOnly
            >
                <Tab id='tab1' title='Operations' panel={<OperationsTable />} />
                {queuesTableEnabled && <Tab id='tab2' title='Queues' panel={<QueuesTable />} />}
                {/* <Tab */}
                {/*     id='tab2' */}
                {/*     title='Operands' */}
                {/*     panel={ */}
                {/*         <Table2 numRows={40} className='operands-table' enableColumnResizing> */}
                {/*             <Column name='Dollars' cellRenderer={dollarCellRenderer} /> */}
                {/*             <Column name='Euros' cellRenderer={euroCellRenderer} /> */}
                {/*         </Table2> */}
                {/*     } */}
                {/* /> */}
                {isLogOutputEnabled && <Tab id='tab3' title='Logs' panel={<LogsOutput />} />}
            </Tabs>
            <Button
                minimal
                icon={IconNames.CROSS}
                className='dock-close-button'
                onClick={() => dispatch(setDockOpenState(false))}
            />
        </div>
    );
};

export default BottomDock;
