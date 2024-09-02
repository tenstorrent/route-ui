// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent AI ULC

import { Button, Card, Overlay, Spinner } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import {
    getDetailedViewOpenState,
    getDetailedViewZoom,
    getSelectedDetailsViewChipId,
    getSelectedDetailsViewUID,
} from 'data/store/selectors/uiState.selectors';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { type Location, useLocation } from 'react-router-dom';
import { GraphOnChipContext } from '../../../data/GraphOnChipContext';
import { Architecture, ComputeNodeType } from '../../../data/Types';
import { closeDetailedView, updateDetailedViewHeight } from '../../../data/store/slices/uiState.slice';
import DetailedViewDRAMRenderer from './DetailedViewDRAM';
import DetailedViewETHRenderer from './DetailedViewETH';
import DetailedViewPCIERenderer from './DetailedViewPCIE';
import DetailedViewCoreRenderer from './DetailedViewCore';

import './DetailedView.scss';
import type { LocationState } from '../../../data/StateTypes';
import AsyncComponent from '../AsyncRenderer';

interface DetailedViewProps {}

const DetailedView: React.FC<DetailedViewProps> = () => {
    const dispatch = useDispatch();
    const location: Location<LocationState> = useLocation();
    const { epoch: temporalEpoch } = location.state;
    const detailedViewElement = useRef<HTMLDivElement>(null);
    const zoom = useSelector(getDetailedViewZoom);
    const isDetailedViewOpen = useSelector(getDetailedViewOpenState);

    const isOpen = useSelector(getDetailedViewOpenState);
    const uid = useSelector(getSelectedDetailsViewUID);
    const chipId = useSelector(getSelectedDetailsViewChipId);
    const graphOnChip = useContext(GraphOnChipContext).getGraphOnChip(temporalEpoch, chipId ?? -1);
    const architecture = graphOnChip?.architecture ?? Architecture.NONE;
    const node = uid ? (graphOnChip?.getNode(uid) ?? null) : null;
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (detailedViewElement.current) {
            const { marginBottom, height } = window.getComputedStyle(detailedViewElement.current);
            const parsedHeight = Number.parseFloat(height.replace('px', ''));
            const parsedMarginBottom = Number.parseFloat(marginBottom.replace('px', ''));

            dispatch(updateDetailedViewHeight((parsedHeight + parsedMarginBottom) * zoom));
            setIsLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [zoom, isOpen, node, isLoading]);

    return (
        <Overlay isOpen={isOpen} enforceFocus={false} hasBackdrop={false} usePortal={false} transitionDuration={0}>
            <Card className={`detailed-view-card ${isDetailedViewOpen ? 'detailed-view-open' : ''}`}>
                <div className='detailed-view-container' style={{ zoom }} ref={detailedViewElement}>
                    <div className='detailed-view-header'>
                        {node && (
                            <h3>
                                {node.type} {node.loc.x},{node.loc.y}
                            </h3>
                        )}
                        <Button small icon={IconNames.CROSS} onClick={() => dispatch(closeDetailedView())} />
                    </div>
                    {node && (
                        <AsyncComponent
                            renderer={() => {
                                const result = (
                                    <div className={`detailed-view-wrap arch-${architecture} type-${node.type}`}>
                                        {node.type === ComputeNodeType.DRAM && (
                                            <DetailedViewDRAMRenderer
                                                node={node}
                                                temporalEpoch={temporalEpoch}
                                                graphOnChip={graphOnChip}
                                            />
                                        )}
                                        {node.type === ComputeNodeType.ETHERNET && (
                                            <DetailedViewETHRenderer
                                                node={node}
                                                temporalEpoch={temporalEpoch}
                                                chipId={chipId}
                                            />
                                        )}
                                        {node.type === ComputeNodeType.PCIE && (
                                            <DetailedViewPCIERenderer
                                                node={node}
                                                temporalEpoch={temporalEpoch}
                                                chipId={chipId}
                                            />
                                        )}
                                        {node.type === ComputeNodeType.CORE && (
                                            <DetailedViewCoreRenderer node={node} temporalEpoch={temporalEpoch} />
                                        )}
                                    </div>
                                );

                                setIsLoading(true);

                                return result;
                            }}
                            loadingContent={
                                <div className='details-loading'>
                                    <Spinner />
                                    <p>Loading details</p>
                                </div>
                            }
                        />
                    )}
                </div>
            </Card>
        </Overlay>
    );
};
export default DetailedView;
