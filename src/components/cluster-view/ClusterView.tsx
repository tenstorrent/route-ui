// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent AI ULC

import { Button, Checkbox, Classes, MenuItem, NumericInput, PopoverPosition, Tooltip } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { ItemRenderer, Select } from '@blueprintjs/select';
import { FC, useContext, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { type Location, useLocation } from 'react-router-dom';
import { ClusterContext } from '../../data/ClusterContext';
import getPipeColor from '../../data/ColorGenerator';
import GraphOnChip from '../../data/GraphOnChip';
import { GraphOnChipContext } from '../../data/GraphOnChipContext';
import { type LocationState } from '../../data/StateTypes';
import { CLUSTER_ETH_POSITION } from '../../data/Types';
import { CLUSTER_NODE_GRID_SIZE } from '../../data/constants';
import {
    getEpochInitialNormalizedTotalOps,
    getEpochNormalizedTotalOps,
    getShowLinkSaturation,
} from '../../data/store/selectors/linkSaturation.selectors';
import { getSelectedPipes } from '../../data/store/selectors/pipeSelection.selectors';
import { updateEpochNormalizedOP } from '../../data/store/slices/linkSaturation.slice';
import { updateMultiplePipeSelection } from '../../data/store/slices/pipeSelection.slice';
import ColorSwatch from '../ColorSwatch';
import FilterableComponent from '../FilterableComponent';
import SearchField from '../SearchField';
import SelectablePipe from '../SelectablePipe';
import LinkCongestionControls from '../grid-sidebar/LinkCongestionControl';
import EthPipeRenderer from './EthPipeRenderer';
import AsyncComponent from '../AsyncRenderer';

const renderItem: ItemRenderer<number> = (
    temporalEpoch,
    //
    { handleClick, modifiers },
) => {
    if (!modifiers.matchesPredicate) {
        return null;
    }

    return (
        <MenuItem
            active={modifiers.active}
            key={temporalEpoch}
            onClick={handleClick}
            text={`Temporal epoch ${temporalEpoch}`}
        />
    );
};
const ClusterView: FC = () => {
    const location: Location<LocationState> = useLocation();
    const { epoch: temporalEpoch } = location.state;

    const { cluster } = useContext(ClusterContext);
    const { getGraphOnChip, getGraphsByTemporalEpoch } = useContext(GraphOnChipContext);
    const dispatch = useDispatch();
    const availableTemporalEpochs = getGraphsByTemporalEpoch();

    const [pciPipes, setPciPipes] = useState<string[]>([]);

    const [pipeFilter, setPipeFilter] = useState<string>('');

    const [selectedEpoch, setSelectedEpoch] = useState<number>(temporalEpoch);

    /** we want explicit control over the size of chips based on cluster size */
    let clusterChipSize = 150;
    const numberOfChips = cluster?.chips.length || 0;
    // single galaxy
    if (numberOfChips === 32) {
        clusterChipSize = 150;
    }
    // nebula
    if (numberOfChips === 2) {
        clusterChipSize = 400;
    }

    const uniquePipeList = useMemo(() => {
        const pciList: string[] = [];
        const pipeList = (availableTemporalEpochs.get(selectedEpoch) ?? [])
            .map(({ graph }) => {
                return [
                    ...(getGraphOnChip(graph.temporalEpoch, graph.chipId)?.ethernetPipes.map((pipe) => pipe) || []),
                    ...(getGraphOnChip(graph.temporalEpoch, graph.chipId)?.pciePipes.map((pipe) => {
                        pciList.push(pipe.id);
                        return pipe;
                    }) || []),
                ];
            })
            .flat()
            .sort((a, b) => a.id.localeCompare(b.id));

        setPciPipes(pciList);

        return pipeList.filter((pipeSegment, index, self) => {
            return self.findIndex((segment) => segment.id === pipeSegment.id) === index;
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedEpoch, getGraphOnChip]);

    const pipeIds = uniquePipeList.map((pipe) => pipe.id);

    const selectFilteredPipes = () => {
        const filtered = pipeIds.filter((id) => id.toLowerCase().includes(pipeFilter.toLowerCase()));
        dispatch(
            updateMultiplePipeSelection({
                ids: filtered,
                selected: true,
            }),
        );
    };

    const pciPipeStateList = useSelector(getSelectedPipes(pciPipes));
    const [showNormalizedSaturation, setShowNormalizedSaturation] = useState<boolean>(true);
    const showLinkSaturation = useSelector(getShowLinkSaturation);
    const normalizedOPsInitial = useSelector(getEpochInitialNormalizedTotalOps(selectedEpoch));
    const normalizedOPs = useSelector(getEpochNormalizedTotalOps(selectedEpoch));

    return (
        <div className='cluster-view-container'>
            <div className='cluster-view-pipelist'>
                <div className='congestion-container'>
                    <LinkCongestionControls showNOCControls={false} />
                    <Checkbox
                        checked={showNormalizedSaturation}
                        label='Normalized congestion'
                        disabled={!showLinkSaturation}
                        onChange={(event) => {
                            setShowNormalizedSaturation(event.currentTarget.checked);
                        }}
                    />
                    <div>
                        <label className={Classes.LABEL} htmlFor='normOpCyclesInput' style={{ marginBottom: '5px' }}>
                            Normalized cycles/input
                        </label>
                        <NumericInput
                            disabled={!showLinkSaturation || !showNormalizedSaturation}
                            id='normOpCyclesInput'
                            value={normalizedOPs}
                            stepSize={1000}
                            minorStepSize={100}
                            majorStepSize={100000}
                            min={1}
                            onValueChange={(value) => {
                                let newValue = value;

                                if (value === 0) {
                                    newValue = 1;
                                }

                                if (Number.isNaN(value)) {
                                    newValue = 1;
                                }

                                dispatch(
                                    updateEpochNormalizedOP({
                                        epoch: selectedEpoch,
                                        updatedValue: newValue,
                                    }),
                                );
                            }}
                            rightElement={
                                <Tooltip
                                    content='Reset to initial normalized value'
                                    usePortal
                                    portalClassName='cluster-reset-tooltip'
                                >
                                    <Button
                                        minimal
                                        onClick={() => {
                                            dispatch(
                                                updateEpochNormalizedOP({
                                                    epoch: selectedEpoch,
                                                    updatedValue: normalizedOPsInitial,
                                                }),
                                            );
                                        }}
                                        icon={IconNames.RESET}
                                    />
                                </Tooltip>
                            }
                        />
                    </div>
                    <hr />
                </div>
                {availableTemporalEpochs.size > 1 && (
                    <Select
                        items={[...availableTemporalEpochs.keys()]}
                        itemRenderer={renderItem}
                        onItemSelect={setSelectedEpoch}
                        activeItem={null}
                        filterable={false}
                    >
                        <Button type='button'>Temporal epoch {selectedEpoch}</Button>
                    </Select>
                )}
                <SearchField
                    disabled={uniquePipeList.length === 0}
                    searchQuery={pipeFilter}
                    onQueryChanged={setPipeFilter}
                    controls={[
                        <Tooltip
                            disabled={uniquePipeList.length === 0}
                            content='Select filtered pipes'
                            position={PopoverPosition.RIGHT}
                            key='select-all-pipes'
                            usePortal={false}
                        >
                            <Button
                                disabled={uniquePipeList.length === 0}
                                icon={IconNames.FILTER_LIST}
                                onClick={() => selectFilteredPipes()}
                            />
                        </Tooltip>,
                        <Tooltip
                            disabled={uniquePipeList.length === 0}
                            content='Deselect ethernet pipes'
                            position={PopoverPosition.RIGHT}
                            key='deselect-all-pipes'
                            usePortal={false}
                        >
                            <Button
                                disabled={uniquePipeList.length === 0}
                                icon={IconNames.FILTER_REMOVE}
                                onClick={() =>
                                    dispatch(
                                        updateMultiplePipeSelection({
                                            ids: pipeIds,
                                            selected: false,
                                        }),
                                    )
                                }
                            />
                        </Tooltip>,
                    ]}
                />
                <div className='pipe-list'>
                    <ul className='scrollable-content' style={{ paddingLeft: 0 }}>
                        {uniquePipeList.map((pipe) => (
                            <FilterableComponent
                                key={pipe.id}
                                filterableString={pipe.id}
                                filterQuery={pipeFilter}
                                component={
                                    <li>
                                        <SelectablePipe
                                            pipeSegment={pipe}
                                            pipeFilter={pipeFilter}
                                            key={pipe.id}
                                            showBandwidth={false}
                                        />
                                    </li>
                                }
                            />
                        ))}
                    </ul>
                </div>
            </div>
            <div
                className='cluster'
                style={{
                    display: 'grid',
                    gap: '5px',
                    gridTemplateColumns: `repeat(${cluster?.totalCols || 0}, ${clusterChipSize}px)`,
                }}
            >
                {cluster?.chips.map((clusterChip) => (
                    <AsyncComponent
                        renderer={() => {
                            let graphOnChip: GraphOnChip | undefined;

                            (availableTemporalEpochs.get(selectedEpoch) ?? []).forEach(({ graph }) => {
                                const currentGraphOnChip = getGraphOnChip(graph.temporalEpoch, graph.chipId);
                                if (currentGraphOnChip?.chipId === clusterChip.id) {
                                    graphOnChip = currentGraphOnChip;
                                }
                            });

                            const ethPosition: Map<CLUSTER_ETH_POSITION, string[]> = new Map();

                            clusterChip.design?.nodes.forEach((node) => {
                                const connectedChip = clusterChip.connectedChipsByEthId.get(node.uid);
                                let position: CLUSTER_ETH_POSITION | null = null;
                                if (connectedChip) {
                                    if (connectedChip?.coordinates.x < clusterChip.coordinates.x) {
                                        position = CLUSTER_ETH_POSITION.LEFT;
                                    }
                                    if (connectedChip?.coordinates.x > clusterChip.coordinates.x) {
                                        position = CLUSTER_ETH_POSITION.RIGHT;
                                    }
                                    if (connectedChip?.coordinates.y < clusterChip.coordinates.y) {
                                        position = CLUSTER_ETH_POSITION.TOP;
                                    }
                                    if (connectedChip?.coordinates.y > clusterChip.coordinates.y) {
                                        position = CLUSTER_ETH_POSITION.BOTTOM;
                                    }
                                }
                                if (position) {
                                    if (ethPosition.has(position)) {
                                        ethPosition.get(position)?.push(node.uid);
                                    } else {
                                        ethPosition.set(position, [node.uid]);
                                    }
                                }
                            });

                            return (
                                <div
                                    className='chip'
                                    key={clusterChip.id}
                                    style={{
                                        width: `${clusterChipSize}px`,
                                        height: `${clusterChipSize}px`,
                                        gridColumn: clusterChip.coordinates.x + 1,
                                        gridRow: clusterChip.coordinates.y + 1,
                                        gridTemplateColumns: `repeat(${CLUSTER_NODE_GRID_SIZE}, 1fr)`,
                                        gridTemplateRows: `repeat(${CLUSTER_NODE_GRID_SIZE}, 1fr)`,
                                    }}
                                >
                                    <span
                                        className='chip-id'
                                        style={{
                                            lineHeight: `${clusterChipSize}px`,
                                            paddingRight: `${clusterChipSize / 4}px`,
                                            paddingTop: `${clusterChipSize / 5}px`,
                                        }}
                                    >
                                        {clusterChip.id}
                                    </span>

                                    {[...ethPosition.entries()].map(([position, value]) => {
                                        return value.map((uid: string, index: number) => {
                                            const node = graphOnChip?.getNode(uid);
                                            return (
                                                <EthPipeRenderer
                                                    key={uid}
                                                    id={uid}
                                                    temporalEpoch={temporalEpoch}
                                                    ethPosition={position}
                                                    node={node}
                                                    index={index}
                                                    clusterChipSize={clusterChipSize}
                                                    showNormalizedSaturation={showNormalizedSaturation}
                                                />
                                            );
                                        });
                                    })}
                                    {clusterChip.mmio && (
                                        <div
                                            style={{
                                                gridColumn: 3,
                                                gridRow: 3,
                                                border: '1px solid #ff8800',
                                                fontSize: '10px',
                                                color: '#fff',
                                                textAlign: 'center',
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                gap: '5px',
                                            }}
                                        >
                                            PCIe
                                            {pciPipeStateList.map((pipeState) => {
                                                return (
                                                    <ColorSwatch
                                                        key={pipeState?.id}
                                                        isVisible={pipeState?.selected ?? false}
                                                        color={
                                                            pipeState?.selected
                                                                ? getPipeColor(pipeState.id)
                                                                : 'transparent'
                                                        }
                                                    />
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        }}
                        loadingContent=''
                    />
                ))}
            </div>
        </div>
    );
};

export default ClusterView;
