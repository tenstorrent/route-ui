import React, { useState } from 'react';
import { Button, Classes, Tab, TabId, Tabs } from '@blueprintjs/core';
import '../../scss/BottomDock.scss';
import { IconNames } from '@blueprintjs/icons';
import { useDispatch, useSelector } from 'react-redux';
import { setDockOpenState } from 'data/store/slices/uiState.slice';
import OperationsTable from './OperationsTable';
import LogsOutput from '../LogsOutput';
import { getLogOutputEnabled } from '../../../data/store/selectors/logging.selector';
import QueuesTable from './QueuesTable';

const BottomDock: React.FC = () => {
    const [selectedTab, setSelectedTab] = useState<TabId>('tab1');
    const dispatch = useDispatch();

    const isLogOutputEnabled = useSelector(getLogOutputEnabled);

    return (
        <div className='dock bottom-dock'>
            <Tabs id='dock-tabs' selectedTabId={selectedTab} onChange={setSelectedTab} className={Classes.TABS}>
                <Tab id='tab1' title='Operations' panel={<OperationsTable />} />
                <Tab id='tab2' title='Queues' panel={<QueuesTable />} />
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
