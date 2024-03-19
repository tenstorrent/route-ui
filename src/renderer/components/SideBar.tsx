import { Button } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Tooltip2 } from '@blueprintjs/popover2';
import { ApplicationMode } from 'data/Types';
import { getApplicationMode, getDockOpenState } from 'data/store/selectors/uiState.selectors';
import { setDockOpenState, setSelectedFile, setSelectedFolder } from 'data/store/slices/uiState.slice';
import React, { useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ChipContext } from '../../data/ChipDataProvider';
import { ClusterDataSource } from '../../data/DataSource';
import { getExperimentalFeatures } from '../../data/store/selectors/experimentalFeatures.selectors';
import { openClusterView } from '../../data/store/slices/clusterView.slice';

export interface SideBarProps {}

export const SideBar: React.FC<SideBarProps> = () => {
    const { resetChips } = useContext(ChipContext);
    const navigate = useNavigate();
    const applicationMode = useSelector(getApplicationMode);
    const { cluster } = useContext(ClusterDataSource);
    const {chipState } = useContext(ChipContext);
    // const ch
    const dispatch = useDispatch();
    // const [clusterViewEnabled, setClusterViewEnabled] = useState(false);
    const reloadAppData = () => {
        resetChips();
        dispatch(setSelectedFile(''));
        dispatch(setSelectedFolder(''));
        navigate('/');
    };

    const handleOpenClusterView = () => {
        dispatch(openClusterView());
    };
    const isDockOpen = useSelector(getDockOpenState);

    const clusterViewEnabled = useSelector(getExperimentalFeatures('showClusterView'));
    const clusterViewButtonEnabled = clusterViewEnabled && cluster?.chips !== undefined && cluster?.chips.length > 1;

    // console.log('clusterViewButtonEnabled', clusterViewButtonEnabled)
    // console.log('clusterViewButtonEnabled', cluster?.chips !== undefined, cluster?.chips.length)
    // console.log(chipState.graphName)

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

            <Tooltip2 content='Cluster view' disabled={!clusterViewButtonEnabled}>
                <Button
                    disabled={!clusterViewButtonEnabled}
                    icon={IconNames.LAYOUT_GRID}
                    text=''
                    onClick={handleOpenClusterView}
                />
            </Tooltip2>
        </div>
    );
};
