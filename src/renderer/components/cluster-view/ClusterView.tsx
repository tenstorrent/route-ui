import React, { FC, useContext, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { CHIP_SIZE } from '../../../utils/DrawingAPI';
import { ClusterDataSource } from '../../../data/DataSource';
import { ComputeNodeType } from '../../../data/Types';
import { ChipContext } from '../../../data/ChipDataProvider';
import { getAvailableGraphsSelector } from '../../../data/store/selectors/uiState.selectors';

export interface ClusterViewDialog {}

const ClusterView: FC<ClusterViewDialog> = () => {
    const { cluster } = useContext(ClusterDataSource);
    const { chipState } = useContext(ChipContext);
    const graphInformation = useSelector(getAvailableGraphsSelector);

    // console.log(chipState);
    // console.log(graphInformation);

    return (
        <div
            className='cluster'
            style={{
                display: 'grid',
                gap: '5px',
                gridTemplateColumns: `repeat(${cluster?.totalCols || 0}, ${CHIP_SIZE}px)`,
            }}
        >
            {cluster?.chips.map((chip) => {
                // const size = `${CHIP_SIZE / (Math.max(chip.design?.totalCols, chip.design.totalRows) + 2)}px`;
                const getEthModule = (x: number, y: number, id: string) => {
                    const ethId = chip.design?.nodes.find((node) => node.uid === id)?.ethId;
                    return (
                        <div
                            title={`${id}:${ethId}`}
                            style={{
                                gridColumn: x,
                                gridRow: y,
                                backgroundColor: '#a2ff00',
                                fontSize: '10px',
                                color: 'black',
                                textAlign: 'center',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            {ethId}
                        </div>
                    );
                };

                const ethPosition: Map<ETH_POSITION, string[]> = new Map();
                chip.design?.nodes.forEach((node) => {
                    const connectedChip = chip.connectedChipsByEthId.get(node.uid);
                    let arrow = '';
                    let position: ETH_POSITION | null = null;
                    if (connectedChip) {
                        if (connectedChip?.coordinates.x < chip.coordinates.x) {
                            arrow = '←';
                            position = ETH_POSITION.LEFT;
                        }
                        if (connectedChip?.coordinates.x > chip.coordinates.x) {
                            arrow = '→';
                            position = ETH_POSITION.RIGHT;
                        }
                        if (connectedChip?.coordinates.y < chip.coordinates.y) {
                            arrow = '↑';
                            position = ETH_POSITION.TOP;
                        }
                        if (connectedChip?.coordinates.y > chip.coordinates.y) {
                            arrow = '↓';
                            position = ETH_POSITION.BOTTOM;
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
                        key={chip.id}
                        style={{
                            width: `${CHIP_SIZE}px`,
                            height: `${CHIP_SIZE}px`,
                            gridColumn: chip.coordinates.x + 1,
                            gridRow: chip.coordinates.y + 1,
                            backgroundColor: '#909090',
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
                            {chip.id}
                        </div>

                        {ethPosition.get(ETH_POSITION.TOP)?.map((e, index) => getEthModule(index + 2, 1, e))}
                        {ethPosition.get(ETH_POSITION.BOTTOM)?.map((e, index) => getEthModule(index + 2, 6, e))}
                        {ethPosition.get(ETH_POSITION.LEFT)?.map((e, index) => getEthModule(1, index + 2, e))}
                        {ethPosition.get(ETH_POSITION.RIGHT)?.map((e, index) => getEthModule(6, index + 2, e))}

                        {chip.mmio && (
                            <div
                                style={{
                                    gridColumn: 3,
                                    gridRow: 3,
                                    backgroundColor: '#ff8800',
                                    fontSize: '10px',
                                    color: 'black',
                                    textAlign: 'center',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}
                            >
                                pci
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

enum ETH_POSITION {
    TOP = 'top',
    BOTTOM = 'bottom',
    LEFT = 'left',
    RIGHT = 'right',
}

export default ClusterView;
