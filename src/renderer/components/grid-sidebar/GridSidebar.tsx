import { FC } from 'react';
import { CLKBandwidthControls } from './CLKBandwidthControls';
import { ZoomControls } from './ZoomControls';
import { CongestionControls } from './CongestionControls';
import { GridControls } from './GridControls';

export const GridSidebar: FC = () => {
    return (
        <div className='inner-sidebar'>
            <div className='inner-sidebar-wrap'>
                <ZoomControls />

                <hr />
                {/* {chip?.hasPipes && ( */}
                {/*     <> */}
                {/*         <Tooltip2 content='Show pipes' position={Position.RIGHT}> */}
                {/*             <Switch */}
                {/*                 checked={showPipes} */}
                {/*                 label='pipes' */}
                {/*                 onChange={(event) => setShowPipes(event.currentTarget.checked)} */}
                {/*             /> */}
                {/*         </Tooltip2> */}
                {/*         <hr /> */}
                {/*     </> */}
                {/* )} */}

                <GridControls />

                <CongestionControls />

                <CLKBandwidthControls />
            </div>
        </div>
    );
};

export default GridSidebar;
