import { Position, Switch } from '@blueprintjs/core';
import { FC } from 'react';
import { Tooltip2 } from '@blueprintjs/popover2';
import { useDispatch, useSelector } from 'react-redux';
import {
    updateShowEmptyLinks,
    updateShowNodeLocation,
    updateShowOperationColors,
} from 'data/store/slices/linkSaturation.slice';
import Collapsible from '../Collapsible';
import { CLKBandwidthControls } from './CLKBandwidthControls';
import {
    getShowEmptyLinks,
    getShowNodeLocation,
    getShowOperationColors,
} from '../../../data/store/selectors/linkSaturation.selectors';
import { ZoomControls } from './ZoomControls';
import { CongestionControls } from './CongestionControls';

export const GridSidebar: FC = () => {
    const dispatch = useDispatch();

    const showEmptyLinks = useSelector(getShowEmptyLinks);
    const showOperationColors = useSelector(getShowOperationColors);
    const showNodeLocation = useSelector(getShowNodeLocation);

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
                <Collapsible
                    contentStyles={{
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                    label='Grid Controls'
                    isOpen={false}
                >
                    <>
                        <Tooltip2 content='Show all links overlay' position={Position.RIGHT}>
                            <Switch
                                checked={showEmptyLinks}
                                label='links'
                                onChange={(event) => dispatch(updateShowEmptyLinks(event.currentTarget.checked))}
                            />
                        </Tooltip2>
                        <Tooltip2 content='Show all operations colors' position={Position.RIGHT}>
                            <Switch
                                checked={showOperationColors}
                                label='operations'
                                onChange={(event) => dispatch(updateShowOperationColors(event.currentTarget.checked))}
                            />
                        </Tooltip2>
                        <Tooltip2 content='Show Compute Node locations' position={Position.RIGHT}>
                            <Switch
                                checked={showNodeLocation}
                                label='location'
                                onChange={(event) => dispatch(updateShowNodeLocation(event.currentTarget.checked))}
                            />
                        </Tooltip2>
                        <hr />
                    </>
                </Collapsible>

                <CongestionControls />

                <CLKBandwidthControls />
            </div>
        </div>
    );
};

export default GridSidebar;
