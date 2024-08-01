// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent AI ULC

import { useContext } from 'react';

import { Icon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { type Location, useLocation } from 'react-router-dom';
import { GraphOnChipContext } from '../../data/GraphOnChipContext';
import usePerfAnalyzerFileLoader from '../hooks/usePerfAnalyzerFileLoader.hooks';
import ClusterViewDialog from './cluster-view/ClusterViewDialog';
import DetailedView from './detailed-view-components/DetailedView';
import type { LocationState } from '../../data/StateTypes';
import ChipRenderer from './ChipRenderer';

export default function GridRender() {
    const { error } = usePerfAnalyzerFileLoader();
    const location: Location<LocationState> = useLocation();
    const { chipId, epoch } = location.state;

    const graphOnChipList = useContext(GraphOnChipContext).getGraphOnChipListForTemporalEpoch(epoch, chipId);

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
                <ChipRenderer id={id} totalCols={totalCols} nodes={[...nodes]} graphName={graphName} />
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
