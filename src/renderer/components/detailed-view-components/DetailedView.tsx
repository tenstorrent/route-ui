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
import React, { useContext, useEffect, useMemo, useRef } from 'react';
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
import { getLinksPerNodeForTemporalEpoch } from '../../../data/store/selectors/linkSaturation.selectors';

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

    const linksData = useSelector(getLinksPerNodeForTemporalEpoch(temporalEpoch));
    const allLinksState = useMemo(
        () => Object.fromEntries(Object.values(linksData).flatMap(({ linksByLinkId: links }) => Object.entries(links))),
        [linksData],
    );

    useEffect(() => {
        if (detailedViewElement.current) {
            const { marginBottom, height } = window.getComputedStyle(detailedViewElement.current);
            const parsedHeight = Number.parseFloat(height.replace('px', ''));
            const parsedMarginBottom = Number.parseFloat(marginBottom.replace('px', ''));

            dispatch(updateDetailedViewHeight((parsedHeight + parsedMarginBottom) * zoom));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [zoom, isOpen, node]);

    return (
        <Overlay isOpen={isOpen} enforceFocus={false} hasBackdrop={false} usePortal={false} transitionDuration={0}>
            <Card className='detailed-view-card'>
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
                        <div className={`detailed-view-wrap arch-${architecture} type-${node.type}`}>
                            {node.type === ComputeNodeType.DRAM && (
                                <DetailedViewDRAMRenderer
                                    node={node}
                                    temporalEpoch={temporalEpoch}
                                    allLinksState={allLinksState}
                                    graphOnChip={graphOnChip}
                                />
                            )}
                            {node.type === ComputeNodeType.ETHERNET && (
                                <DetailedViewETHRenderer allLinksState={allLinksState} node={node} />
                            )}
                            {node.type === ComputeNodeType.PCIE && (
                                <DetailedViewPCIERenderer allLinksState={allLinksState} node={node} />
                            )}
                        </div>
                    )}
                </div>
            </Card>
        </Overlay>
    );
};
export default DetailedView;
