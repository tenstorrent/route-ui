// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent AI ULC

import { type CSSProperties, type FC, useContext, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Spinner } from '@blueprintjs/core';
import { type Location, useLocation } from 'react-router-dom';
import AsyncComponent from './AsyncRenderer';
import { getGridZoom } from '../data/store/selectors/uiState.selectors';
import { ClusterContext } from '../data/ClusterContext';
import { NODE_SIZE } from '../utils/DrawingAPI';
import NodeGridElement from './NodeGridElement';
import type { ComputeNode } from '../data/GraphOnChip';
import type { LocationState } from '../data/StateTypes';

const ChipRenderer: FC<{
    id: number;
    totalCols: number;
    nodes: ComputeNode[];
    graphName: string;
}> = ({ id, totalCols, nodes, graphName }) => {
    const location: Location<LocationState> = useLocation();
    const { chipId, epoch } = location.state;
    const gridZoom = useSelector(getGridZoom);

    const { cluster } = useContext(ClusterContext);
    const clusterChipsMap = useMemo(
        () => Object.fromEntries((cluster?.chips ?? []).map((chip) => [chip.id, chip])),
        [cluster],
    );

    /**
     * This is needed to force a second render of the whole chip.
     *
     * The reason for a second render is that pipes do not render correctly when changing chips,
     * so we need to force a re-render to actually show the pipes.
     */
    const [shouldRerender, setShouldRerender] = useState(1);
    useEffect(() => {
        setShouldRerender(1);
    }, [chipId]);

    return (
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
                                        currentChipId={chipId}
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
                        <Spinner size={50} />
                        {id} - {graphName}
                    </div>
                </div>
            }
            postRenderCallback={() => {
                if (shouldRerender === 1) {
                    setShouldRerender(Math.random());
                }
            }}
        />
    );
};

export default ChipRenderer;
