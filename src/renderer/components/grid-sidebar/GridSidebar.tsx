import { FC } from 'react';
import { CLKBandwidthControls } from './CLKBandwidthControls';
import { ZoomControls } from './ZoomControls';
import { CongestionControls } from './CongestionControls';
import ModelControls from './ModelControls';
import { GridControls } from './GridControls';

export const GridSidebar: FC = () => {
    return (
        <div className='inner-sidebar'>
            <div className='inner-sidebar-wrap'>
                <ZoomControls />
                <hr />
                <GridControls />
                <CongestionControls />
                <CLKBandwidthControls />
                <hr />
                <ModelControls />
            </div>
        </div>
    );
};

export default GridSidebar;
