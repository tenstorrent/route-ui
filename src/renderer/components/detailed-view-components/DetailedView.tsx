// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent Inc.

import { Button, Card, Overlay } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import {
    getDetailedViewOpenState,
    getDetailedViewZoom,
    getSelectedDetailsViewChipId,
    getSelectedDetailsViewUID,
} from 'data/store/selectors/uiState.selectors';
import React, { type ReactElement, useContext, useEffect, useRef, useState, useTransition } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { type Location, useLocation } from 'react-router-dom';
import { GraphOnChipContext } from '../../../data/GraphOnChipContext';
import { Architecture, ComputeNodeType } from '../../../data/Types';
import { closeDetailedView, updateDetailedViewHeight } from '../../../data/store/slices/uiState.slice';
import DetailedViewDRAMRenderer from './DetailedViewDRAM';
import DetailedViewETHRenderer from './DetailedViewETH';
import DetailedViewPCIERenderer from './DetailedViewPCIE';

import './DetailedView.scss';
import type { LocationState } from '../../../data/StateTypes';

interface DetailedViewProps {}

const DetailedView: React.FC<DetailedViewProps> = () => {
    const dispatch = useDispatch();
    const location: Location<LocationState> = useLocation();
    const { epoch: temporalEpoch } = location.state;
    const detailedViewElement = useRef<HTMLDivElement>(null);
    const zoom = useSelector(getDetailedViewZoom);

    const isOpen = useSelector(getDetailedViewOpenState);
    const uid = useSelector(getSelectedDetailsViewUID);
    const chipId = useSelector(getSelectedDetailsViewChipId);
    const graphOnChip = useContext(GraphOnChipContext).getGraphOnChip(temporalEpoch, chipId ?? -1);
    const architecture = graphOnChip?.architecture ?? Architecture.NONE;
    const node = uid ? graphOnChip?.getNode(uid) ?? null : null;

    const [dramView, setDramView] = useState<ReactElement | null>(null);
    const [ethView, setEthView] = useState<ReactElement | null>(null);
    const [pcieView, setPcieView] = useState<ReactElement | null>(null);
    const [isLoading, startTransition] = useTransition();

    useEffect(() => {
        if (detailedViewElement.current) {
            const { marginBottom, height } = window.getComputedStyle(detailedViewElement.current);
            const parsedHeight = Number.parseFloat(height.replace('px', ''));
            const parsedMarginBottom = Number.parseFloat(marginBottom.replace('px', ''));

            dispatch(updateDetailedViewHeight((parsedHeight + parsedMarginBottom) * zoom));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [zoom, isOpen, node]);

    if (node && !dramView && !ethView && !pcieView) {
        startTransition(() => {
            if (node.type === ComputeNodeType.DRAM) {
                setDramView(
                    <DetailedViewDRAMRenderer node={node} temporalEpoch={temporalEpoch} graphOnChip={graphOnChip} />,
                );
            }

            if (node.type === ComputeNodeType.ETHERNET) {
                setEthView(<DetailedViewETHRenderer node={node} temporalEpoch={temporalEpoch} />);
            }

            if (node.type === ComputeNodeType.PCIE) {
                setPcieView(<DetailedViewPCIERenderer node={node} temporalEpoch={temporalEpoch} />);
            }
        });
    }

    return (
        <Overlay isOpen={isOpen} enforceFocus={false} hasBackdrop={false} usePortal={false} transitionDuration={0}>
            <Card className='detailed-view-card'>
                <div className='detailed-view-container' style={{ zoom }} ref={detailedViewElement}>
                    <div className='detailed-view-header'>
                        <h3>{!node || isLoading ? 'Details' : `${node.type} ${node.loc.x},${node.loc.y}`}</h3>
                        <Button small icon={IconNames.CROSS} onClick={() => dispatch(closeDetailedView())} />
                    </div>
                    {!node || isLoading ? (
                        <p>Loading...</p>
                    ) : (
                        <div className={`detailed-view-wrap arch-${architecture} type-${node.type}`}>
                            {dramView}
                            {ethView}
                            {pcieView}
                        </div>
                    )}
                </div>
            </Card>
        </Overlay>
    );
};
export default DetailedView;
