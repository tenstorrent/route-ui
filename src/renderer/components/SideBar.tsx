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
import { openClusterView } from '../../data/store/slices/clusterView.slice';
import { ClusterDataSource } from '../../data/DataSource';
import { getExperimentalFeatures } from '../../data/store/selectors/experimentalFeatures.selectors';

export interface SideBarProps {}

export const SideBar: React.FC<SideBarProps> = ({}) => {
    const navigate = useNavigate();
    const applicationMode = useSelector(getApplicationMode);
    const { cluster } = useContext(ClusterDataSource);
    const dispatch = useDispatch();
    // const [clusterViewEnabled, setClusterViewEnabled] = useState(false);
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
    const isDockOpen = useSelector(getDockOpenState);



    const clusterViewEnabled = useSelector(getExperimentalFeatures('showClusterView'));



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
            {clusterViewEnabled && cluster?.chips !== undefined && cluster?.chips.length > 1 && (
                <Tooltip2 content='Cluster view'>
                    <Button icon={IconNames.LAYOUT_GRID} text='' onClick={handleOpenClusterView} />
                </Tooltip2>
            )}
        </div>
    );
};
