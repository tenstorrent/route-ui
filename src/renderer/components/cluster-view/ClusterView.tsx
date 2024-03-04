import React, { FC, useContext, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ItemRenderer, Select } from '@blueprintjs/select';
import { Button, MenuItem, PopoverPosition } from '@blueprintjs/core';
import * as d3 from 'd3';
import { Tooltip2 } from '@blueprintjs/popover2';
import { IconNames } from '@blueprintjs/icons';
import { drawEthPipes } from '../../../utils/DrawingAPI';
import { ClusterDataSource } from '../../../data/DataSource';
import { ChipContext } from '../../../data/ChipDataProvider';
import { getAvailableGraphsSelector } from '../../../data/store/selectors/uiState.selectors';
import { GraphRelationshipState, PipeSelection } from '../../../data/StateTypes';
import SelectablePipe from '../SelectablePipe';
import Chip, { ComputeNode, PipeSegment } from '../../../data/Chip';
import { CLUSTER_ETH_POSITION, EthernetLinkName } from '../../../data/Types';
import { RootState } from '../../../data/store/createStore';
import { updateFocusPipe, updateMultiplePipeSelection } from '../../../data/store/slices/pipeSelection.slice';
import SearchField from '../SearchField';
import FilterableComponent from '../FilterableComponent';

export interface ClusterViewDialog {}

const NODE_GRID_SIZE = 6;

const renderItem: ItemRenderer<GraphRelationshipState[]> = (
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
const ClusterView: FC<ClusterViewDialog> = () => {
    const { cluster } = useContext(ClusterDataSource);
    const { chipState, getChipByGraphName } = useContext(ChipContext);
    const dispatch = useDispatch();
    const graphInformation = useSelector(getAvailableGraphsSelector);
    const selectedGraph = chipState.graphName;
    const availableTemporalEpochs: GraphRelationshipState[][] = [];
    const [pipeFilter, setPipeFilter] = useState<string>('');
    graphInformation.forEach((item) => {
        if (availableTemporalEpochs[item.temporalEpoch]) {
            availableTemporalEpochs[item.temporalEpoch].push(item);
        } else {
            availableTemporalEpochs[item.temporalEpoch] = [item];
        }
    });
    const selectedGraphItem = graphInformation.find((graph) => graph.name === selectedGraph);

    const [selectesEpoch, setSelectedEpoch] = useState<GraphRelationshipState[]>(
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

    const pipeList: PipeSegment[] = selectesEpoch
        .map((graph) => {
            return (
                getChipByGraphName(graph.name)?.ethernetPipes.map((pipe) => {
                    return pipe;
                }) || []
            );
        })
        .flat();

    pipeList.sort((a, b) => {
        return a.id.localeCompare(b.id);
    });

    const uniquePipeList: PipeSegment[] = pipeList.filter((pipeSegment, index, self) => {
        return self.findIndex((segment) => segment.id === pipeSegment.id) === index;
    });

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

    return (
        <div className='cluster-view-container'>
            <div
                className='cluster-view-pipelist'
                // this is to address the bug with a sticking focus pipe
                onMouseOut={() => {
                    dispatch(updateFocusPipe(null));
                }}
            >
                {availableTemporalEpochs.length > 1 && (
                    <Select
                        items={availableTemporalEpochs}
                        itemRenderer={renderItem}
                        onItemSelect={setSelectedEpoch}
                        activeItem={null}
                        filterable={false}
                    >
                        <Button type='button'>Temporal epoch {selectesEpoch[0]?.temporalEpoch}</Button>
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
                        >
                            <Button
                                disabled={uniquePipeList.length === 0}
                                icon={IconNames.FILTER_LIST}
                                onClick={() => selectFilteredPipes()}
                            />
                        </Tooltip2>,
                        <Tooltip2
                            disabled={uniquePipeList.length === 0}
                            content='Deselect ETH pipes'
                            position={PopoverPosition.RIGHT}
                            key='deselect-all-pipes'
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
                    let chip: Chip | undefined;

                    selectesEpoch.forEach((graph) => {
                        const chipByGraphName = getChipByGraphName(graph.name);
                        if (chipByGraphName?.chipId === clusterChip.id) {
                            chip = chipByGraphName;
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
                                gridTemplateColumns: `repeat(${NODE_GRID_SIZE}, 1fr)`,
                                gridTemplateRows: `repeat(${NODE_GRID_SIZE}, 1fr)`,
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
                                    const node = chip?.getNode(uid);
                                    return (
                                        <EthPipeRenderer
                                            key={uid}
                                            id={uid}
                                            ethPosition={position}
                                            node={node}
                                            index={index}
                                            clusterChipSize={clusterChipSize}
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
                                    }}
                                >
                                    PCIe
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

interface EthPipeRendererProps {
    id: string;
    node: ComputeNode | undefined;
    ethPosition: CLUSTER_ETH_POSITION;
    index: number;
    clusterChipSize: number;
}

const EthPipeRenderer: FC<EthPipeRendererProps> = ({ id, node, ethPosition, index, clusterChipSize }) => {
    const svgRef = useRef<SVGSVGElement | null>(null);
    const pipeSelection = useSelector((state: RootState) => state.pipeSelection.pipes);
    const selectedPipeIds = Object.values(pipeSelection)
        .filter((pipe: PipeSelection) => pipe.selected)
        .map((pipe: PipeSelection) => pipe.id);

    const { x, y } = calculateEthPosition(ethPosition, index);

    const nodePipeIn = !node
        ? []
        : node
              .getInternalLinksForNode()
              .filter((link) => link.name === EthernetLinkName.ETH_IN)
              .map((link) => link.pipes)
              .map((pipe) => pipe.map((pipeSegment) => pipeSegment.id))
              .flat();

    const nodePipeOut = !node
        ? []
        : node
              .getInternalLinksForNode()
              .filter((link) => link.name === EthernetLinkName.ETH_OUT)
              .map((link) => link.pipes)
              .map((pipe) => pipe.map((pipeSegment) => pipeSegment.id))
              .flat();
    const size = clusterChipSize / NODE_GRID_SIZE - 5; // grid, 5 gap

    const focusPipeId = useSelector((state: RootState) => state.pipeSelection.focusPipe);

    useEffect(() => {
        if (svgRef.current) {
            const svg = d3.select(svgRef.current);
            svg.selectAll('*').remove();
            if (focusPipeId) {
                drawEthPipes(
                    svg,
                    ethPosition,
                    nodePipeIn.filter((pipe) => pipe === focusPipeId),
                    EthernetLinkName.ETH_IN,
                    size,
                );
                drawEthPipes(
                    svg,
                    ethPosition,
                    nodePipeOut.filter((pipe) => pipe === focusPipeId),
                    EthernetLinkName.ETH_OUT,
                    size,
                );
            } else {
                drawEthPipes(
                    svg,
                    ethPosition,
                    nodePipeIn.filter((pipeId) => selectedPipeIds.includes(pipeId)) || [],
                    EthernetLinkName.ETH_IN,
                    size,
                );
                drawEthPipes(
                    svg,
                    ethPosition,
                    nodePipeOut.filter((pipeId) => selectedPipeIds.includes(pipeId)) || [],
                    EthernetLinkName.ETH_OUT,
                    size,
                );
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pipeSelection, nodePipeIn, nodePipeOut, focusPipeId, selectedPipeIds]);

    return (
        <div
            title={`${id}`}
            className={`eth eth-position-${ethPosition}`}
            style={{
                opacity: nodePipeIn.length > 0 || nodePipeOut.length > 0 ? 1 : 0.2,
                gridColumn: x,
                gridRow: y,
                fontSize: '10px',
                color: 'black',
                textAlign: 'center',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: `${size}px`,
                height: `${size}px`,
            }}
        >
            <svg className='eth-svg' ref={svgRef} width={`${size}px`} height={`${size}px`} />
        </div>
    );
};

const calculateEthPosition = (ethPosition: CLUSTER_ETH_POSITION, index: number) => {
    let x = 0;
    let y = 0;
    switch (ethPosition) {
        case CLUSTER_ETH_POSITION.TOP:
            x = index + 2;
            y = 1;
            break;
        case CLUSTER_ETH_POSITION.BOTTOM:
            x = index + 2;
            y = NODE_GRID_SIZE;
            break;
        case CLUSTER_ETH_POSITION.LEFT:
            x = 1;
            y = index + 2;
            break;
        case CLUSTER_ETH_POSITION.RIGHT:
            x = NODE_GRID_SIZE;
            y = index + 2;
            break;
        default:
            return { x, y };
    }
    return { x, y };
};
export default ClusterView;