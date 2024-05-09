// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent Inc.

import { useContext } from 'react';
import { useSelector } from 'react-redux';

import { Icon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { type Location, useLocation } from 'react-router-dom';
import { NODE_SIZE } from '../../utils/DrawingAPI';
import { ComputeNode } from '../../data/GraphOnChip';
import { GraphOnChipContext } from '../../data/GraphOnChipContext';
import { getGridZoom } from '../../data/store/selectors/uiState.selectors';
import { mapIterable } from '../../utils/IterableHelpers';
import usePerfAnalyzerFileLoader from '../hooks/usePerfAnalyzerFileLoader.hooks';
import NodeGridElement from './NodeGridElement';
import ClusterViewDialog from './cluster-view/ClusterViewDialog';
import DetailedView from './detailed-view-components/DetailedView';
import type { LocationState } from '../../data/StateTypes';

export default function GridRender() {
    const gridZoom = useSelector(getGridZoom);
    const { error } = usePerfAnalyzerFileLoader();
    const location: Location<LocationState> = useLocation();
    const { graphName = '', chipId = -1, epoch } = location.state;

    const graphOnChip = useContext(GraphOnChipContext).getGraphOnChip(epoch, chipId);
    const graphList = useContext(GraphOnChipContext).getGraphOnChipListForTemporalEpoch(epoch);

    const style =
        graphList.length > 1
            ? {
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '30px',
              }
            : {};

    return (
        <div className='main-content' style={style}>
            {graphOnChip ? (
                <div className='grid-container'>
                    <div
                        className='node-container'
                        style={{
                            zoom: `${gridZoom}`,
                            gridTemplateColumns: `repeat(${graphOnChip.totalCols + 1}, ${NODE_SIZE}px)`,
                        }}
                    >
                        {[
                            ...mapIterable(graphOnChip.nodes, (node: ComputeNode) => {
                                return (
                                    <NodeGridElement
                                        graphName={graphName}
                                        temporalEpoch={epoch}
                                        node={node}
                                        key={node.uid}
                                    />
                                );
                            }),
                        ]}
                    </div>
                </div>
            ) : (
                graphList.map((data) => {
                    return (
                        <div className='grid-container'>
                            <div
                                className='node-container'
                                style={{
                                    zoom: `${gridZoom}`,
                                    gridTemplateColumns: `repeat(${data.graphOnChip.totalCols + 1}, ${NODE_SIZE}px)`,
                                }}
                            >
                                {[...data.graphOnChip.nodes].map((node: ComputeNode) => {
                                    return (
                                        <NodeGridElement
                                            node={node}
                                            temporalEpoch={epoch}
                                            graphName={data.graph.name}
                                            key={node.uid}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    );
                })
            )}
            {graphOnChip === undefined && graphList.length === 0 && (
                <div className='invalid-data-message'>
                    <Icon icon={IconNames.WARNING_SIGN} size={50} />
                    {error ? (
                        <div className='error-message'>
                            <p>{error}</p>
                        </div>
                    ) : (
                        <div className='no-data'>
                            <p>Unable to parse selected folder</p>
                        </div>
                    )}
                </div>
            )}
            <DetailedView />
            <ClusterViewDialog />
        </div>
    );
}
