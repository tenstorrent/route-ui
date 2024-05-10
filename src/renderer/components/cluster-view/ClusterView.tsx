// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent AI ULC

/* eslint-disable jsx-a11y/mouse-events-have-key-events */
import { Button, Checkbox, Classes, MenuItem, NumericInput, PopoverPosition } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Tooltip2 } from '@blueprintjs/popover2';
import { ItemRenderer, Select } from '@blueprintjs/select';
import { FC, useContext, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ClusterContext } from '../../../data/ClusterContext';
import getPipeColor from '../../../data/ColorGenerator';
import GraphOnChip from '../../../data/GraphOnChip';
import { GraphOnChipContext } from '../../../data/GraphOnChipContext';
import { GraphRelationship } from '../../../data/StateTypes';
import { CLUSTER_ETH_POSITION } from '../../../data/Types';
import { CLUSTER_NODE_GRID_SIZE } from '../../../data/constants';
import {
    getEpochAdjustedTotalOps,
    getEpochNormalizedTotalOps,
    getShowLinkSaturation,
} from '../../../data/store/selectors/linkSaturation.selectors';
import { getSelectedPipes } from '../../../data/store/selectors/pipeSelection.selectors';
import { updateEpochNormalizedOP } from '../../../data/store/slices/linkSaturation.slice';
import { updateMultiplePipeSelection } from '../../../data/store/slices/pipeSelection.slice';
import ColorSwatch from '../ColorSwatch';
import FilterableComponent from '../FilterableComponent';
import SearchField from '../SearchField';
import SelectablePipe from '../SelectablePipe';
import LinkCongestionControls from '../grid-sidebar/LinkCongestionControl';
import EthPipeRenderer from './EthPipeRenderer';

const renderItem: ItemRenderer<GraphRelationship[]> = (
    item,
    //
    { handleClick, modifiers },
) => {
    if (!modifiers.matchesPredicate) {
        return null;
    }

    return (
        <MenuItem
            active={modifiers.active}
            key={item[0].temporalEpoch}
            onClick={handleClick}
            text={`Temporal epoch ${item[0]?.temporalEpoch}`}
        />
    );
};
const ClusterView: FC = () => {
    const { cluster } = useContext(ClusterContext);
    const { getGraphOnChip, getActiveGraphName, getGraphRelationshipList } = useContext(GraphOnChipContext);
    const dispatch = useDispatch();
    const graphInformation = getGraphRelationshipList();
    const selectedGraph = getActiveGraphName();
    const availableTemporalEpochs: GraphRelationship[][] = [];
    const [pciPipes, setPciPipes] = useState<string[]>([]);

    const [pipeFilter, setPipeFilter] = useState<string>('');
    graphInformation.forEach((item) => {
        if (availableTemporalEpochs[item.temporalEpoch]) {
            availableTemporalEpochs[item.temporalEpoch].push(item);
        } else {
            availableTemporalEpochs[item.temporalEpoch] = [item];
        }
    });
    const selectedGraphItem = graphInformation.find((graph) => graph.name === selectedGraph);

    const [selectedEpoch, setSelectedEpoch] = useState<GraphRelationship[]>(
        availableTemporalEpochs[selectedGraphItem?.temporalEpoch || 0] || [],
    );

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
        const pipeList = selectedEpoch
            .map((graph) => {
                return [
                    ...(getGraphOnChip(graph.name)?.ethernetPipes.map((pipe) => pipe) || []),
                    ...(getGraphOnChip(graph.name)?.pciePipes.map((pipe) => {
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
    const [normalizedSaturation, setNormalizedSaturation] = useState<boolean>(true);
    const showLinkSaturation = useSelector(getShowLinkSaturation);
    const normalizedAdjustedOPsList = useSelector(getEpochAdjustedTotalOps);
    const normalizedOPsList = useSelector(getEpochNormalizedTotalOps);

    const normalizedAdjustedOPs = useMemo(() => {
        return normalizedAdjustedOPsList[selectedEpoch[0]?.temporalEpoch] || 1;
    }, [normalizedAdjustedOPsList, selectedEpoch]);

    const normalizedOPsInitial = useMemo(() => {
        return normalizedOPsList[selectedEpoch[0]?.temporalEpoch] || 1;
    }, [normalizedOPsList, selectedEpoch]);

    return (
        <div className='cluster-view-container'>
            <div className='cluster-view-pipelist'>
                <div className='congestion-container'>
                    <LinkCongestionControls showNOCControls={false} />
                    <Checkbox
                        checked={normalizedSaturation}
                        label='Normalized congestion'
                        disabled={!showLinkSaturation}
                        onChange={(event) => {
                            setNormalizedSaturation(event.currentTarget.checked);
                        }}
                    />
                    <div>
                        {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                        <label className={Classes.LABEL} htmlFor='normOpCyclesInput' style={{ marginBottom: '5px' }}>
                            Normalized cycles/input
                        </label>
                        <NumericInput
                            disabled={!showLinkSaturation || !normalizedSaturation}
                            id='normOpCyclesInput'
                            value={normalizedAdjustedOPs}
                            stepSize={normalizedAdjustedOPs / 10}
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
                                        epoch: selectedEpoch[0]?.temporalEpoch,
                                        updatedValue: newValue,
                                    }),
                                );
                            }}
                            rightElement={
                                <Tooltip2
                                    content='Reset to initial normalized value'
                                    usePortal
                                    portalClassName='cluster-reset-tooltip'
                                >
                                    <Button
                                        minimal
                                        onClick={() => {
                                            dispatch(
                                                updateEpochNormalizedOP({
                                                    epoch: selectedEpoch[0]?.temporalEpoch,
                                                    updatedValue: normalizedOPsInitial,
                                                }),
                                            );
                                        }}
                                        icon={IconNames.RESET}
                                    />
                                </Tooltip2>
                            }
                        />
                    </div>
                    <hr />
                </div>
                {availableTemporalEpochs.length > 1 && (
                    <Select
                        items={availableTemporalEpochs}
                        itemRenderer={renderItem}
                        onItemSelect={setSelectedEpoch}
                        activeItem={null}
                        filterable={false}
                    >
                        <Button type='button'>Temporal epoch {selectedEpoch[0]?.temporalEpoch}</Button>
                    </Select>
                )}
                <SearchField
                    disabled={uniquePipeList.length === 0}
                    searchQuery={pipeFilter}
                    onQueryChanged={setPipeFilter}
                    controls={[
                        <Tooltip2
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
                        </Tooltip2>,
                        <Tooltip2
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
                        </Tooltip2>,
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
                {cluster?.chips.map((clusterChip) => {
                    let graphOnChip: GraphOnChip | undefined;
                    let graphName: string | undefined;
                    selectedEpoch.forEach((graph) => {
                        const chipByGraphName = getGraphOnChip(graph.name);
                        if (chipByGraphName?.chipId === clusterChip.id) {
                            graphOnChip = chipByGraphName;
                            graphName = graph.name;
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
                                            graphName={graphName}
                                            ethPosition={position}
                                            node={node}
                                            index={index}
                                            clusterChipSize={clusterChipSize}
                                            normalizedSaturation={normalizedSaturation}
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
                                                key={pipeState.id}
                                                isVisible={pipeState?.selected}
                                                color={pipeState?.selected ? getPipeColor(pipeState.id) : 'transparent'}
                                            />
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ClusterView;
