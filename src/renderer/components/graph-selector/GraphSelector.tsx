// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent Inc.

import React, { FC, useContext } from 'react';
import { Popover2 } from '@blueprintjs/popover2';
import { Button, Menu, MenuDivider, MenuItem } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { type Location, useLocation } from 'react-router-dom';
import { GraphOnChipContext } from '../../../data/GraphOnChipContext';

import './GraphSelector.scss';
import type { GraphRelationship, LocationState } from '../../../data/StateTypes';

function formatDisplayGraphName({
    name = '',
    temporalEpoch = -1,
    chipId = -1,
    showTemporalEpoch = false,
}: Partial<GraphRelationship & { showTemporalEpoch: boolean }>) {
    return `${name} (${showTemporalEpoch ? `Epoch: ${temporalEpoch} ` : ''}Chip: ${chipId})`;
}

interface GraphSelectorProps {
    disabled?: boolean;
    label?: string;
    onSelectGraph: (graphRelationship: GraphRelationship) => void;
    onSelectTemporalEpoch: (temporalEpoch: number) => void;
}

const GraphSelector: FC<GraphSelectorProps> = ({ disabled, label, onSelectGraph, onSelectTemporalEpoch }) => {
    const location: Location<LocationState> = useLocation();
    const { chipId, epoch = -1 } = location?.state ?? {};
    const { getGraphsByTemporalEpoch, getGraphOnChipListForTemporalEpoch } = useContext(GraphOnChipContext);
    const temporalEpochs = [...getGraphsByTemporalEpoch().entries()];
    let selectedItemText = '';

    if (chipId !== undefined) {
        selectedItemText = formatDisplayGraphName({
            ...(getGraphOnChipListForTemporalEpoch(epoch)[chipId]?.graph ?? {}),
            showTemporalEpoch: getGraphOnChipListForTemporalEpoch(epoch).length <= 1,
        });
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
                                {graphRelationships.length > 1 && (
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
                                {graphRelationships.map(({ graph: graphRelationship }) => (
                                    <MenuItem
                                        key={`${temporalEpoch}-${graphRelationship.chipId}`}
                                        text={formatDisplayGraphName({
                                            ...graphRelationship,
                                            showTemporalEpoch: graphRelationships.length <= 1,
                                        })}
                                        onClick={() => onSelectGraph(graphRelationship)}
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
