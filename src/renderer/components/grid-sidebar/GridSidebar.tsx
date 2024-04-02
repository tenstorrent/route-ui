/**
 * SPDX-License-Identifier: Apache-2.0
 * SPDX-FileCopyrightText: © 2024 Tenstorrent Inc.
 */

import { Switch } from '@blueprintjs/core';
import { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getHighContrastState } from '../../../data/store/selectors/uiState.selectors';
import { setHighContrastState } from '../../../data/store/slices/uiState.slice';
import { CLKBandwidthControls } from './CLKBandwidthControls';
import { CongestionControls } from './CongestionControls';
import { GridControls } from './GridControls';
import ModelControls from './ModelControls';
import { ZoomControls } from './ZoomControls';

export const GridSidebar: FC = () => {
    const dispatch = useDispatch();
    const isHighContrast = useSelector(getHighContrastState);
    return (
        <div className='grid-sidebar inner-sidebar'>
            <div className='inner-sidebar-wrap'>
                <Switch
                    checked={isHighContrast}
                    label='Enable high contrast'
                    onChange={(event) => dispatch(setHighContrastState(event.currentTarget.checked))}
                />
                <hr />
                <ZoomControls />
                <hr />
                <GridControls />
                <CongestionControls />
                <CLKBandwidthControls />
                <hr />
                <ModelControls />
            </div>
            <div className='panel-overlay'></div>
        </div>
    );
};

export default GridSidebar;
