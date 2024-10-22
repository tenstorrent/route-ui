// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent AI ULC

import { AnchorButton, Button, Tooltip } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { ApplicationMode } from '../data/Types';
import { getApplicationMode, getDetailedViewOpenState } from '../data/store/selectors/uiState.selectors';
import { setSelectedFile, setSelectedFolder, toggleDockOpenState } from '../data/store/slices/uiState.slice';
import React, { useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { type Location, useLocation, useNavigate } from 'react-router-dom';
import { GraphOnChipContext } from '../data/GraphOnChipContext';
import { ClusterContext } from '../data/ClusterContext';
import { openClusterView } from '../data/store/slices/clusterView.slice';
import type { LocationState, NavigateOptions } from '../data/StateTypes';

export interface SideBarProps {}

export const SideBar: React.FC<SideBarProps> = () => {
    const { resetGraphOnChipState } = useContext(GraphOnChipContext);
    const location: Location<LocationState> = useLocation();
    const navigate = useNavigate();
    const applicationMode = useSelector(getApplicationMode);
    const { cluster } = useContext(ClusterContext);
    const dispatch = useDispatch();
    const reloadAppData = () => {
        resetGraphOnChipState();
        dispatch(setSelectedFile(''));
        dispatch(setSelectedFolder(''));
        navigate('/', {
            state: {
                epoch: -1,
                previous: {
                    path: location.pathname,
                },
            },
        } satisfies NavigateOptions);
    };

    const handleOpenClusterView = () => {
        dispatch(openClusterView());
    };
    const isDetailsViewOpen = useSelector(getDetailedViewOpenState);

    const clusterViewButtonEnabled = cluster?.chips !== undefined && cluster?.chips.length > 1;

    return (
        <div className='sidebar'>
            <Tooltip content='Load new dataset'>
                <Button icon={IconNames.Home} text='' onClick={reloadAppData} />
            </Tooltip>
            {applicationMode === ApplicationMode.PERF_ANALYZER && (
                <Tooltip content='Show/Hide table dock'>
                    <AnchorButton
                        disabled={isDetailsViewOpen}
                        icon={IconNames.APPLICATION}
                        text=''
                        onClick={() => requestAnimationFrame(() => dispatch(toggleDockOpenState()))}
                    />
                </Tooltip>
            )}

            <Tooltip content='Cluster view' disabled={!clusterViewButtonEnabled}>
                <Button
                    disabled={!clusterViewButtonEnabled}
                    icon={IconNames.LAYOUT_GRID}
                    text=''
                    onClick={handleOpenClusterView}
                />
            </Tooltip>
        </div>
    );
};
