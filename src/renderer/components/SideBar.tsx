import { Button } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Tooltip2 } from '@blueprintjs/popover2';
import { ApplicationMode, Architecture } from 'data/Types';
import {
    clearAvailableGraphs,
    setDockOpenState,
    setSelectedArchitecture,
    setSelectedFile,
    setSelectedFolder,
} from 'data/store/slices/uiState.slice';
import React, { useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { getApplicationMode, getDockOpenState } from 'data/store/selectors/uiState.selectors';
import { process } from '@electron/remote';
import Chip from '../../data/Chip';
import DataSource, { ClusterDataSource } from '../../data/DataSource';
import useLogging from '../hooks/useLogging.hook';
import { openClusterView } from '../../data/store/slices/clusterView.slice';
import { openDetailedView } from '../../data/store/slices/detailedView.slice';

export interface SideBarProps {
    updateData: (data: Chip) => void;
}

export const SideBar: React.FC<SideBarProps> = ({ updateData }) => {
    const navigate = useNavigate();
    const applicationMode = useSelector(getApplicationMode);
    const { chip } = useContext(DataSource);
    const { cluster } = useContext(ClusterDataSource);
    const dispatch = useDispatch();
    const reloadAppData = () => {
        dispatch(clearAvailableGraphs());
        dispatch(setSelectedFile(''));
        dispatch(setSelectedArchitecture(Architecture.NONE));
        dispatch(setSelectedFolder(''));
        navigate('/');
    };

    const handleOpenClusterView = () => {
        dispatch(openClusterView());
    };
    // const traceCluster = () => {
    //     console.log('Cluster:', cluster);
    //     console.log(cluster?.totalRows, cluster?.totalCols);
    // };
    const isDockOpen = useSelector(getDockOpenState);

    return (
        <div className='sidebar'>
            <Tooltip2 content='Load new dataset'>
                <Button icon={IconNames.Home} text='' onClick={reloadAppData} />
            </Tooltip2>
            {applicationMode === ApplicationMode.PERF_ANALYZER && (
                <Tooltip2 content='Show/Hide table dock'>
                    <Button
                        icon={IconNames.APPLICATION}
                        text=''
                        onClick={() => dispatch(setDockOpenState(!isDockOpen))}
                    />
                </Tooltip2>
            )}
            {process.env.NODE_ENV === 'development' && (
                <Button icon={IconNames.FULL_STACKED_CHART} text='' onClick={handleOpenClusterView} />
            )}
        </div>
    );
};
