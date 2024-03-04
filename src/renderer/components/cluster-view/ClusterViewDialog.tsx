import React, { useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Classes, Overlay } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { RootState } from 'data/store/createStore';

import '../../scss/ClusterView.scss';
import { ClusterContext, ClusterDataSource } from '../../../data/DataSource';
import { closeClusterView } from '../../../data/store/slices/clusterView.slice';
import ClusterView from './ClusterView';

interface DetailedViewProps {
    zoom: number;
}

const ClusterViewDialog: React.FC<DetailedViewProps> = ({ zoom }) => {
    const dispatch = useDispatch();
    const { cluster } = useContext<ClusterContext>(ClusterDataSource);
    const { isOpen } = useSelector((state: RootState) => state.clusterView);

    return (
        <Overlay
            className={Classes.OVERLAY}
            isOpen={isOpen}
            enforceFocus={false}
            hasBackdrop
            usePortal
            lazy
            canEscapeKeyClose
            canOutsideClickClose
            onClose={() => dispatch(closeClusterView())}
            transitionDuration={0}
        >

            <div className={'cluster-view-wrap'}>
                <div className=''>
                    <div className='cluster-view-header'>
                        <Button small icon={IconNames.CROSS} onClick={() => dispatch(closeClusterView())} />
                    </div>
                    <ClusterView />
                </div>
            </div>


        </Overlay>
    );
};
export default ClusterViewDialog;
