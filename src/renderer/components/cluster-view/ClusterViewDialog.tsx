// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent AI ULC.

import { Button, Classes, Overlay } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closeClusterView } from '../../../data/store/slices/clusterView.slice';
import ClusterView from './ClusterView';

import { getClusterView } from '../../../data/store/selectors/clusterView.selector';
import './ClusterView.scss';

const ClusterViewDialog: React.FC = () => {
    const dispatch = useDispatch();
    const { isOpen } = useSelector(getClusterView);

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
