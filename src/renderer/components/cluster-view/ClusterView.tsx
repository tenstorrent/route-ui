/* eslint-disable jsx-a11y/mouse-events-have-key-events */
import { IconNames } from '@blueprintjs/icons';
import { Tooltip2 } from '@blueprintjs/popover2';
import { ItemRenderer, Select } from '@blueprintjs/select';
import { Button, Checkbox, MenuItem, PopoverPosition } from '@blueprintjs/core';
import * as d3 from 'd3';
import { FC, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import GraphOnChip, { ComputeNode } from '../../../data/GraphOnChip';
import { GraphOnChipContext } from '../../../data/GraphOnChipDataProvider';
import getPipeColor from '../../../data/ColorGenerator';
import { ClusterDataSource } from '../../../data/DataSource';
import { GraphRelationshipState, PipeSelection } from '../../../data/StateTypes';
import { CLUSTER_ETH_POSITION, EthernetLinkName } from '../../../data/Types';
import { RootState } from '../../../data/store/createStore';
import {
    getAllLinksForGraph,
    getLinkSaturation,
    getShowLinkSaturation,
} from '../../../data/store/selectors/linkSaturation.selectors';
import { getSelectedPipes } from '../../../data/store/selectors/pipeSelection.selectors';
import { updateFocusPipe, updateMultiplePipeSelection } from '../../../data/store/slices/pipeSelection.slice';
import { calculateLinkCongestionColor, drawEthLink, drawEthPipes } from '../../../utils/DrawingAPI';
import ColorSwatch from '../ColorSwatch';
import FilterableComponent from '../FilterableComponent';
import SearchField from '../SearchField';
import SelectablePipe from '../SelectablePipe';
import LinkCongestionControls from '../grid-sidebar/LinkCongestionControl';

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
    const { getGraphOnChip, getGraphName, getGraphRelationshipStateList } = useContext(GraphOnChipContext);
    const dispatch = useDispatch();
    const graphInformation = getGraphRelationshipStateList();
    const selectedGraph = getGraphName();
    const availableTemporalEpochs: GraphRelationshipState[][] = [];
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

    const [selectedEpoch, setSelectedEpoch] = useState<GraphRelationshipState[]>(
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

    const pciPipeStateList = useSelector((state: RootState) => getSelectedPipes(state, pciPipes));
    const [normalizedSaturation, setNormalizedSaturation] = useState<boolean>(false);
    const showLinkSaturation = useSelector(getShowLinkSaturation);
    return (
        <div className='cluster-view-container'>
            <div
                className='cluster-view-pipelist'
                // this is to address the bug with a sticking focus pipe

                onMouseOut={() => {
                    dispatch(updateFocusPipe(null));
                }}
            >
                <div className='congestion-container'>
                    <LinkCongestionControls showNOCControls={false} />
                    {/* TODO: enable or remove once the decisions around normalized ocngestion are made */}
                    {/* <Checkbox */}
                    {/*     checked={normalizedSaturation} */}
                    {/*     label='Normalized congestion' */}
                    {/*     disabled={!showLinkSaturation} */}
                    {/*     onChange={(event) => { */}
                    {/*         setNormalizedSaturation(event.currentTarget.checked); */}
                    {/*     }} */}
                    {/* /> */}
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

interface EthPipeRendererProps {
    id: string;
    node: ComputeNode | undefined;
    graphName: string | undefined;
    ethPosition: CLUSTER_ETH_POSITION;
    index: number;
    clusterChipSize: number;
    normalizedSaturation: boolean;
}

const EthPipeRenderer: FC<EthPipeRendererProps> = ({
    id,
    node,
    graphName,
    ethPosition,
    index,
    clusterChipSize,
    normalizedSaturation,
}) => {
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

    const showLinkSaturation = useSelector(getShowLinkSaturation);
    const linkSaturationTreshold = useSelector(getLinkSaturation);
    const linksData = useSelector((state: RootState) => getAllLinksForGraph(state, graphName || ''));
    const isHighContrast = useSelector((state: RootState) => state.uiState.highContrastEnabled);
    useEffect(() => {
        if (svgRef.current) {
            const svg = d3.select(svgRef.current);
            svg.selectAll('*').remove();
            if (showLinkSaturation && linksData) {
                node?.internalLinks.forEach((link) => {
                    if (link.name === EthernetLinkName.ETH_IN || link.name === EthernetLinkName.ETH_OUT) {
                        const linkStateData = linksData[link.uid];
                        if (normalizedSaturation) {
                            if (linkStateData && linkStateData.normalizedSaturation >= linkSaturationTreshold) {
                                const color = calculateLinkCongestionColor(
                                    linkStateData.normalizedSaturation,
                                    0,
                                    isHighContrast,
                                );
                                drawEthLink(svg, ethPosition, link.name, size, color, 6);
                            }
                        } else {
                            if (linkStateData && linkStateData.saturation >= linkSaturationTreshold) {
                                const color = calculateLinkCongestionColor(linkStateData.saturation, 0, isHighContrast);
                                drawEthLink(svg, ethPosition, link.name, size, color, 6);
                            }
                        }
                    }
                });
            }
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
    }, [
        pipeSelection,
        nodePipeIn,
        nodePipeOut,
        focusPipeId,
        selectedPipeIds,
        showLinkSaturation,
        linkSaturationTreshold,
        linksData,
    ]);

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
