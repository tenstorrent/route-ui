// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent Inc.

import { CSSProperties, useContext, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { Icon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { type Location, useLocation } from 'react-router-dom';
import { NODE_SIZE } from '../../utils/DrawingAPI';
import { ComputeNode } from '../../data/GraphOnChip';
import { GraphOnChipContext } from '../../data/GraphOnChipContext';
import { getGridZoom } from '../../data/store/selectors/uiState.selectors';
import usePerfAnalyzerFileLoader from '../hooks/usePerfAnalyzerFileLoader.hooks';
import NodeGridElement from './NodeGridElement';
import ClusterViewDialog from './cluster-view/ClusterViewDialog';
import DetailedView from './detailed-view-components/DetailedView';
import type { LocationState } from '../../data/StateTypes';
import { ClusterContext } from '../../data/ClusterContext';
import AsyncComponent from './AsyncRenderer';

export default function GridRender() {
    const gridZoom = useSelector(getGridZoom);
    const { error } = usePerfAnalyzerFileLoader();
    const location: Location<LocationState> = useLocation();
    const { chipId, epoch } = location.state;

    const graphOnChipList = useContext(GraphOnChipContext).getGraphOnChipListForTemporalEpoch(epoch, chipId);

    const { cluster } = useContext(ClusterContext);
    const clusterChipsMap = useMemo(
        () => Object.fromEntries((cluster?.chips ?? []).map((chip) => [chip.id, chip])),
        [cluster],
    );

    const style =
        graphOnChipList.length > 1
            ? {
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '30px',
              }
            : {};

    return (
        <div className='main-content' style={style}>
            {graphOnChipList.map(({ graphOnChip: { chipId: id, totalCols, nodes }, graph: { name: graphName } }) => (
                <AsyncComponent
                    renderer={() => {
                        const clusterChip = clusterChipsMap[id];
                        const clusterChipPositioning: CSSProperties = {};

                        if (clusterChip) {
                            clusterChipPositioning.gridColumn = clusterChip.coordinates.x + 1;
                            clusterChipPositioning.gridRow = clusterChip.coordinates.y + 1;
                        }

                        clusterChipPositioning.contentVisibility = 'auto';

                        return (
                            <div className='grid-container' style={clusterChipPositioning} key={id}>
                                <div
                                    className='node-container'
                                    style={{
                                        zoom: `${gridZoom}`,
                                        gridTemplateColumns: `repeat(${totalCols + 1}, ${NODE_SIZE}px)`,
                                    }}
                                >
                                    {[...nodes].map((node: ComputeNode) => {
                                        return (
                                            <NodeGridElement
                                                node={node}
                                                temporalEpoch={epoch}
                                                key={node.uid}
                                                connectedEth={clusterChip?.connectedChipsByEthId.get(node.uid) || null}
                                            />
                                        );
                                    })}
                                </div>
                                <div className='chip-label'>
                                    {id} - {graphName}
                                </div>
                            </div>
                        );
                    }}
                    loadingContent={
                        <div className='grid-container' key={id}>
                            <div className='node-container loading-graph' style={{ zoom: `${gridZoom}` }}>
                                Loading {id} - {graphName}...
                            </div>
                        </div>
                    }
                />
            ))}
            {graphOnChipList.length === 0 && (
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
