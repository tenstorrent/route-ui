import React, {useState} from 'react';
import {Button, Classes, Tab, TabId, Tabs} from '@blueprintjs/core';
import {Cell, Column, Table2} from '@blueprintjs/table';
import '../scss/BottomDock.scss';
import {IconNames} from '@blueprintjs/icons';
import {useDispatch} from 'react-redux';
import {setDockOpenState} from '../../data/store';


const BottomDock: React.FC = ({}) => {
    const [selectedTab, setSelectedTab] = useState<TabId>('tab1');
    const dispatch = useDispatch()
    const dollarCellRenderer = (rowIndex: number) => (
        <Cell>{`$${(rowIndex * 40).toFixed(2)}`}</Cell>
    );
    const euroCellRenderer = (rowIndex: number) => (
        <Cell>{`€${(rowIndex * 40 * 0.85).toFixed(2)}`}</Cell>
    );
    return (
        <div className='dock bottom-dock'>
            <Tabs id='dock-tabs' selectedTabId={selectedTab} onChange={setSelectedTab} className={Classes.TABS}>
                <Tab id='tab1' title='Operands' panel={
                    <Table2 numRows={40} className="operands-table" enableColumnResizing>
                        <Column name="Dollars" cellRenderer={dollarCellRenderer} />
                        <Column name="Euros" cellRenderer={euroCellRenderer} />
                    </Table2>
                } />
                <Tab id='tab2' title='Operations' panel={<pre>SOME STUFF HERE</pre>} />
                <Tab id='tab3' title='Console' panel={<pre>SOME STUFF HERE</pre>} />
            </Tabs>
            <Button
                minimal
                icon={IconNames.CROSS}
                className="dock-close-button"
                onClick={() => dispatch(setDockOpenState(false))} />
        </div>
    );
}

export default BottomDock;
