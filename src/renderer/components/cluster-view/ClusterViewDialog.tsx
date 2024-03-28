/**
 * SPDX-License-Identifier: Apache-2.0
 * SPDX-FileCopyrightText: © 2024 Tenstorrent Inc.
 */

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Classes, Overlay } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { RootState } from 'data/store/createStore';
import { closeClusterView } from '../../../data/store/slices/clusterView.slice';
import ClusterView from './ClusterView';

import './ClusterView.scss';

const ClusterViewDialog: React.FC = ({}) => {
    const dispatch = useDispatch();
    const { isOpen } = useSelector((state: RootState) => state.clusterView);

    return (
        <Overlay
            className={`${Classes.OVERLAY} cluster-view-overlay`}
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
            <div className='cluster-view-wrap'>
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
