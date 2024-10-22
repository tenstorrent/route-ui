// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent AI ULC

import { FC, useContext, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Slider, Switch, Tooltip } from '@blueprintjs/core';

import { IconNames } from '@blueprintjs/icons';
import { type Location, useLocation } from 'react-router-dom';
import {
    getOperationPerformanceTreshold,
    getShowOperationPerformanceGrid,
} from '../../data/store/selectors/operationPerf.selectors';
import {
    updateOperationPerformanceThreshold,
    updateShowOperationPerformanceGrid,
} from '../../data/store/slices/operationPerf.slice';
import { clearAllPipes, selectAllPipes } from '../../data/store/slices/pipeSelection.slice';
import { selectOperandList } from '../../data/store/slices/nodeSelection.slice';
import { getHighContrastState } from '../../data/store/selectors/uiState.selectors';
import { calculateOpCongestionColor } from '../../utils/DrawingAPI';

import Collapsible from '../Collapsible';

import QueueIconPlus from '../../assets/QueueIconPlus';
import QueueIconMinus from '../../assets/QueueIconMinus';
import { GraphOnChipContext } from '../../data/GraphOnChipContext';
import LinkCongestionControl from './LinkCongestionControl';
import type { LocationState } from '../../data/StateTypes';

export const CongestionControls: FC = () => {
    const location: Location<LocationState> = useLocation();
    const { epoch, chipId } = location.state;

    const graphOnChipList = useContext(GraphOnChipContext).getGraphOnChipListForTemporalEpoch(epoch, chipId);

    const operationsOnGraph = useMemo(
        () => graphOnChipList.flatMap(({ graphOnChip }) => [...graphOnChip.operations].map(({ name }) => name)),
        [graphOnChipList],
    );
    const queuesOnGraph = useMemo(
        () => graphOnChipList.flatMap(({ graphOnChip }) => [...graphOnChip.queues].map(({ name }) => name)),
        [graphOnChipList],
    );

    const maxBwLimitedFactor = graphOnChipList.reduce(
        (bwLimitedFactor, { graphOnChip }) => Math.max(graphOnChip.details.maxBwLimitedFactor, bwLimitedFactor),
        10,
    );
    const hasPipes = graphOnChipList.some(({ graphOnChip }) => graphOnChip.hasPipes);

    const dispatch = useDispatch();

    const operationPerformanceTreshold = useSelector(getOperationPerformanceTreshold);

    const showOperationPerformanceGrid = useSelector(getShowOperationPerformanceGrid);

    const isHC: boolean = useSelector(getHighContrastState);

    const opCongestionLegendStyle = {
        background: `linear-gradient(to right, ${calculateOpCongestionColor(0, 0, isHC)}, ${calculateOpCongestionColor(
            maxBwLimitedFactor / 2,
            0,
            isHC,
        )}, ${calculateOpCongestionColor(maxBwLimitedFactor, 0, isHC)})`,
    };

    return (
        <>
            <Switch
                checked={showOperationPerformanceGrid}
                label='Op Perf'
                onChange={(event) => dispatch(updateShowOperationPerformanceGrid(event.currentTarget.checked))}
            />
            <div
                className='congestion-legend'
                style={{ ...(showOperationPerformanceGrid ? opCongestionLegendStyle : null) }}
            />
            <Slider
                className='link-saturation-slider'
                min={0}
                max={maxBwLimitedFactor || 10}
                disabled={!showOperationPerformanceGrid}
                labelStepSize={maxBwLimitedFactor > 5 ? Math.max(5, maxBwLimitedFactor / 5) : 1}
                value={Math.min(operationPerformanceTreshold, maxBwLimitedFactor)}
                onChange={(value: number) =>
                    requestAnimationFrame(() => dispatch(updateOperationPerformanceThreshold(value)))
                }
                labelRenderer={(value) => `${value.toFixed(0)}`}
            />
            <hr />

            {hasPipes && (
                <Collapsible
                    label='Congestion'
                    isOpen
                    contentStyles={{
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <>
                        <LinkCongestionControl />
                        <hr />
                        <div>
                            <Tooltip content='Select all pipes'>
                                <Button icon={IconNames.FILTER_OPEN} onClick={() => dispatch(selectAllPipes())} />
                            </Tooltip>
                            &nbsp;
                            <Tooltip content='Deselect all pipes'>
                                <Button icon={IconNames.FILTER_REMOVE} onClick={() => dispatch(clearAllPipes())} />
                            </Tooltip>
                        </div>
                        <hr />
                        <div>
                            <Tooltip
                                content={`Select all operations for active graph${
                                    graphOnChipList.length > 1 ? 's' : ''
                                }`}
                            >
                                <Button
                                    icon={IconNames.CUBE_ADD}
                                    onClick={() =>
                                        dispatch(
                                            selectOperandList({
                                                operands: operationsOnGraph,
                                                selected: true,
                                            }),
                                        )
                                    }
                                />
                            </Tooltip>
                            &nbsp;
                            <Tooltip
                                content={`Deselect all operations for active graph${
                                    graphOnChipList.length > 1 ? 's' : ''
                                }`}
                            >
                                <Button
                                    icon={IconNames.CUBE_REMOVE}
                                    onClick={() =>
                                        dispatch(
                                            selectOperandList({
                                                operands: operationsOnGraph,
                                                selected: false,
                                            }),
                                        )
                                    }
                                />
                            </Tooltip>
                        </div>
                        <hr />
                        <div>
                            <Tooltip
                                content={`Select all queues for active graph${graphOnChipList.length > 1 ? 's' : ''}`}
                            >
                                <Button
                                    icon={<QueueIconPlus />}
                                    onClick={() =>
                                        dispatch(
                                            selectOperandList({
                                                operands: queuesOnGraph,
                                                selected: true,
                                            }),
                                        )
                                    }
                                />
                            </Tooltip>
                            &nbsp;
                            <Tooltip
                                content={`Deselect all queues for active graph${graphOnChipList.length > 1 ? 's' : ''}`}
                            >
                                <Button
                                    icon={<QueueIconMinus />}
                                    onClick={() =>
                                        dispatch(
                                            selectOperandList({
                                                operands: queuesOnGraph,
                                                selected: false,
                                            }),
                                        )
                                    }
                                />
                            </Tooltip>
                        </div>
                        <hr />
                    </>
                </Collapsible>
            )}
        </>
    );
};

export default CongestionControls;
