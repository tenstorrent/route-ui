// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent Inc.

import { FC, useContext } from 'react';
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
    const location: Location<LocationState> = useLocation();
    const { chipId = -1, epoch } = location.state;
    const { getGraphsListByTemporalEpoch, getGraphOnChipListForTemporalEpoch } = useContext(GraphOnChipContext);
    const temporalEpochs = [...getGraphsListByTemporalEpoch().entries()];
    const selectedGraph = getGraphOnChipListForTemporalEpoch(epoch)[chipId]?.graph.name;

    return (
        <Popover2
            content={
                <div className='graph-selector-picker'>
                    <h3>{label}</h3>
                    <Menu>
                        {temporalEpochs.map(([temporalEpoch, graphRelationships], index) => (
                            <>
                                {index > 0 && <MenuDivider />}
                                <MenuItem
                                    icon={IconNames.SERIES_DERIVED}
                                    key={`temporal-epoch-${temporalEpoch}`}
                                    onClick={() => onSelectTemporalEpoch(temporalEpoch)}
                                    text={`Temporal Epoch ${temporalEpoch}`}
                                    className='graph-selector-temporal-epoch'
                                />
                                {graphRelationships.map((graphRelationship) => (
                                    <MenuItem
                                        key={`temporal-epoch-${temporalEpoch}-${graphRelationship.name}`}
                                        text={graphRelationship.name}
                                        onClick={() => onSelectGraph(graphRelationship.name)}
                                        className='graph-selector-graph'
                                    />
                                ))}
                            </>
                        ))}
                    </Menu>
                </div>
            }
            disabled={disabled || temporalEpochs?.length === 0}
            placement='right'
        >
            <Button icon={IconNames.GRAPH} disabled={disabled}>
                {selectedGraph || (label ?? 'Select graph')}
            </Button>
        </Popover2>
    );
};

GraphSelector.defaultProps = {
    disabled: false,
    label: undefined,
};

export default GraphSelector;
