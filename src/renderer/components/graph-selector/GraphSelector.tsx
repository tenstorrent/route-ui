// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent AI ULC

import React, { FC, useContext } from 'react';
import { Popover2 } from '@blueprintjs/popover2';
import { Button, Menu, MenuDivider, MenuItem } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { type Location, useLocation } from 'react-router-dom';
import { GraphOnChipContext } from '../../../data/GraphOnChipContext';

import './GraphSelector.scss';
import type { LocationState } from '../../../data/StateTypes';

interface GraphSelectorProps {
    disabled?: boolean;
    label?: string;
    onSelectGraph: (graphName: string) => void;
    onSelectTemporalEpoch: (temporalEpoch: number) => void;
}

const GraphSelector: FC<GraphSelectorProps> = ({ disabled, label, onSelectGraph, onSelectTemporalEpoch }) => {
    // TODO: remove once temporal epoch are production ready
    const IS_TEMPORAL_EPOCH_NAVIGATION_ENABLED = process.env.NODE_ENV === 'development';
    const location: Location<LocationState> = useLocation();
    const { chipId, epoch = -1 } = location?.state ?? {};
    const { getGraphsListByTemporalEpoch, getGraphOnChipListForTemporalEpoch } = useContext(GraphOnChipContext);
    const temporalEpochs = [...getGraphsListByTemporalEpoch().entries()];
    let selectedItemText = '';

    if (chipId !== undefined) {
        selectedItemText = getGraphOnChipListForTemporalEpoch(epoch)[chipId]?.graph.name;
    } else if (epoch >= 0) {
        selectedItemText = `Temporal Epoch ${epoch}`;
    }

    return (
        <Popover2
            content={
                <div className='graph-selector-picker'>
                    <h3>{label}</h3>
                    <Menu>
                        {temporalEpochs.map(([temporalEpoch, graphRelationships], index) => (
                            <React.Fragment key={temporalEpoch}>
                                {IS_TEMPORAL_EPOCH_NAVIGATION_ENABLED && (
                                    <>
                                        {index > 0 && <MenuDivider />}
                                        <MenuItem
                                            icon={IconNames.SERIES_DERIVED}
                                            onClick={() => onSelectTemporalEpoch(temporalEpoch)}
                                            text={`Temporal Epoch ${temporalEpoch}`}
                                            className='graph-selector-temporal-epoch'
                                        />
                                    </>
                                )}
                                {graphRelationships.map((graphRelationship) => (
                                    <MenuItem
                                        key={`${temporalEpoch}-${graphRelationship.name}`}
                                        text={graphRelationship.name}
                                        onClick={() => onSelectGraph(graphRelationship.name)}
                                        className='graph-selector-graph'
                                    />
                                ))}
                            </React.Fragment>
                        ))}
                    </Menu>
                </div>
            }
            disabled={disabled || temporalEpochs?.length === 0}
            placement='right'
        >
            <Button icon={IconNames.GRAPH} disabled={disabled}>
                {selectedItemText || (label ?? 'Select graph')}
            </Button>
        </Popover2>
    );
};

GraphSelector.defaultProps = {
    disabled: false,
    label: undefined,
};

export default GraphSelector;
