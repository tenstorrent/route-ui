import React, { FC, useContext, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { ItemRenderer, Select } from '@blueprintjs/select';
import { Button, MenuItem } from '@blueprintjs/core';
import * as d3 from 'd3';
import { CHIP_SIZE, drawEthPipes } from '../../../utils/DrawingAPI';
import { ClusterDataSource } from '../../../data/DataSource';
import { ChipContext } from '../../../data/ChipDataProvider';
import { getAvailableGraphsSelector, getGraphNameSelector } from '../../../data/store/selectors/uiState.selectors';
import { GraphRelationshipState, PipeSelection } from '../../../data/StateTypes';
import SelectablePipe from '../SelectablePipe';
import Chip, { ComputeNode, PipeSegment } from '../../../data/Chip';
import { CLUSTER_ETH_POSITION, EthernetLinkName } from '../../../data/Types';
import { RootState } from '../../../data/store/createStore';

export interface ClusterViewDialog {}

const renderItem: ItemRenderer<GraphRelationshipState[]> = (
    item,
    //
    { handleClick, modifiers },
) => {
    // if (!modifiers.matchesPredicate) {
    //     return null;
    // }
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

    const graphInformation = useSelector(getAvailableGraphsSelector);
    const selectedGraph = chipState.graphName;
    const availableTemporalEpochs: GraphRelationshipState[][] = []; // = graphInformation.filter((graphRelationship) => graphRelationship.temporalEpoch);
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

    return (
        <div className='cluster-view-container'>
            <div className='cluster-view-pipelist'>
                <Select
                    items={availableTemporalEpochs}
                    itemRenderer={renderItem}
                    onItemSelect={setSelectedEpoch}
                    filterable={false}
                >
                    <Button type='button'>Temporal epoch {selectesEpoch[0]?.temporalEpoch}</Button>
                </Select>
                <div
                    className='pipes'
                    style={{
                        maxHeight: 'calc(100vh - 100px)',
                        minWidth: '150px',
                        overflowY: 'scroll',
                    }}
                >
                    <ul className='scrollable-content' style={{ paddingLeft: 0 }}>
                        {uniquePipeList.map((pipe) => {
                            return (
                                <li>
                                    <SelectablePipe
                                        pipeSegment={pipe}
                                        pipeFilter=''
                                        key={pipe.id}
                                        showBandwidth={false}
                                    />
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>
            <div
                className='cluster'
                style={{
                    display: 'grid',
                    gap: '5px',
                    gridTemplateColumns: `repeat(${cluster?.totalCols || 0}, ${CHIP_SIZE}px)`,
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
                    const getEthModule = (ethPosition: CLUSTER_ETH_POSITION, x: number, y: number, uid: string) => {
                        const node = chip?.getNode(uid);
                        return <EthPipeRenderer key={uid} id={uid} ethPosition={ethPosition} node={node} x={x} y={y} />;
                    };

                    const ethPosition: Map<CLUSTER_ETH_POSITION, string[]> = new Map();
                    clusterChip.design?.nodes.forEach((node) => {
                        const connectedChip = clusterChip.connectedChipsByEthId.get(node.uid);
                        let arrow = '';
                        let position: CLUSTER_ETH_POSITION | null = null;
                        if (connectedChip) {
                            if (connectedChip?.coordinates.x < clusterChip.coordinates.x) {
                                arrow = '←';
                                position = CLUSTER_ETH_POSITION.LEFT;
                            }
                            if (connectedChip?.coordinates.x > clusterChip.coordinates.x) {
                                arrow = '→';
                                position = CLUSTER_ETH_POSITION.RIGHT;
                            }
                            if (connectedChip?.coordinates.y < clusterChip.coordinates.y) {
                                arrow = '↑';
                                position = CLUSTER_ETH_POSITION.TOP;
                            }
                            if (connectedChip?.coordinates.y > clusterChip.coordinates.y) {
                                arrow = '↓';
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
                                width: `${CHIP_SIZE}px`,
                                height: `${CHIP_SIZE}px`,
                                gridColumn: clusterChip.coordinates.x + 1,
                                gridRow: clusterChip.coordinates.y + 1,
                                backgroundColor: '#646464',
                                display: 'grid',
                                gap: '5px',
                                gridTemplateColumns: `repeat(6, 1fr)`,
                                gridTemplateRows: `repeat(6, 1fr)`,
                                position: 'relative',
                            }}
                        >
                            <div
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    fontSize: '44px',
                                    lineHeight: `${CHIP_SIZE}px`,
                                    textAlign: 'center',
                                    pointerEvents: 'none',
                                }}
                            >
                                {clusterChip.id}
                            </div>

                            {ethPosition
                                .get(CLUSTER_ETH_POSITION.TOP)
                                ?.map((uid, index) => getEthModule(CLUSTER_ETH_POSITION.TOP, index + 2, 1, uid))}
                            {ethPosition
                                .get(CLUSTER_ETH_POSITION.BOTTOM)
                                ?.map((uid, index) => getEthModule(CLUSTER_ETH_POSITION.BOTTOM, index + 2, 6, uid))}
                            {ethPosition
                                .get(CLUSTER_ETH_POSITION.LEFT)
                                ?.map((uid, index) => getEthModule(CLUSTER_ETH_POSITION.LEFT, 1, index + 2, uid))}
                            {ethPosition
                                .get(CLUSTER_ETH_POSITION.RIGHT)
                                ?.map((uid, index) => getEthModule(CLUSTER_ETH_POSITION.RIGHT, 6, index + 2, uid))}

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
    x: number;
    y: number;
}

const EthPipeRenderer: FC<EthPipeRendererProps> = ({ id, node, ethPosition, x, y }) => {
    const svgRef = useRef<SVGSVGElement | null>(null);
    const pipeSelection = useSelector((state: RootState) => state.pipeSelection.pipes);
    const selectedPipeIds = Object.values(pipeSelection)
        .filter((pipe: PipeSelection) => pipe.selected)
        .map((pipe: PipeSelection) => pipe.id);

    const nodePipeIn = !node
        ? []
        : node
              .getInternalLinksForNode()
              .filter((link) => link.name === EthernetLinkName.ETH_IN)
              .map((link) => link.pipes)
              .map((pipe) => pipe.map((pipeSegment) => pipeSegment.id))
              .flat()
              .filter((pipeId) => selectedPipeIds.includes(pipeId)) || [];
    const nodePipeOut = !node
        ? []
        : node
              .getInternalLinksForNode()
              .filter((link) => link.name === EthernetLinkName.ETH_OUT)
              .map((link) => link.pipes)
              .map((pipe) => pipe.map((pipeSegment) => pipeSegment.id))
              .flat()
              .filter((pipeId) => selectedPipeIds.includes(pipeId)) || [];

    const size = CHIP_SIZE / 6 - 5; // 6 grid, 5 gap

    useEffect(() => {
        if (svgRef.current) {
            const svg = d3.select(svgRef.current);
            svg.selectAll('*').remove();

            drawEthPipes(svg, ethPosition, nodePipeIn, EthernetLinkName.ETH_IN, size);
            drawEthPipes(svg, ethPosition, nodePipeOut, EthernetLinkName.ETH_OUT, size);
        }
    }, [ethPosition, nodePipeIn, nodePipeOut, selectedPipeIds]);

    return (
        <div
            title={`${id}:${node?.uid || ''}`}
            className={`eth eth-position-${ethPosition}`}
            style={{
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
export default ClusterView;
