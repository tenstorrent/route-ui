// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent AI ULC

import { Button, Card, Overlay } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import {
    getDetailedViewOpenState,
    getDetailedViewZoom,
    getSelectedDetailsViewUID,
} from 'data/store/selectors/uiState.selectors';
import React, { useContext, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { GraphOnChipContext } from '../../../data/GraphOnChipContext';
import { ComputeNodeType } from '../../../data/Types';
import { closeDetailedView, updateDetailedViewHeight } from '../../../data/store/slices/uiState.slice';
import DetailedViewDRAMRenderer from './DetailedViewDRAM';
import DetailedViewETHRenderer from './DetailedViewETH';
import DetailedViewPCIERenderer from './DetailedViewPCIE';

import './DetailedView.scss';

interface DetailedViewProps {}

const DetailedView: React.FC<DetailedViewProps> = () => {
    const dispatch = useDispatch();
    const { getActiveGraphOnChip, getActiveGraphName, graphOnChipList } = useContext(GraphOnChipContext);
    const graphOnChip = getActiveGraphOnChip();
    const graphName = getActiveGraphName();
    const detailedViewElement = useRef<HTMLDivElement>(null);
    const zoom = useSelector(getDetailedViewZoom);

    const architecture = graphOnChipList[graphName]?.architecture;
    const isOpen = useSelector(getDetailedViewOpenState);
    const uid = useSelector(getSelectedDetailsViewUID);
    const node = uid ? graphOnChip?.getNode(uid) : null;

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
                                <DetailedViewDRAMRenderer graphName={graphName} node={node} />
                            )}
                            {node.type === ComputeNodeType.ETHERNET && (
                                <DetailedViewETHRenderer graphName={graphName} node={node} />
                            )}
                            {node.type === ComputeNodeType.PCIE && (
                                <DetailedViewPCIERenderer graphName={graphName} node={node} />
                            )}
                        </div>
                    )}
                </div>
            </Card>
        </Overlay>
    );
};
export default DetailedView;
