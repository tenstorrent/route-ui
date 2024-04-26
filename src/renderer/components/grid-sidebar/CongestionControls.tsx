// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent Inc.

import React, { FC, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Slider, Switch } from '@blueprintjs/core';
import { Tooltip2 } from '@blueprintjs/popover2';

import { IconNames } from '@blueprintjs/icons';
import {
    getOperationPerformanceTreshold,
    getShowOperationPerformanceGrid,
} from '../../../data/store/selectors/operationPerf.selectors';
import {
    updateOperationPerformanceThreshold,
    updateShowOperationPerformanceGrid,
} from '../../../data/store/slices/operationPerf.slice';
import { clearAllPipes, selectAllPipes } from '../../../data/store/slices/pipeSelection.slice';
import {
    clearAllOperationsForGraph,
    clearAllQueuesforGraph,
    selectAllOperationsForGraph,
    selectAllQueuesForGraph,
} from '../../../data/store/slices/nodeSelection.slice';
import { getHighContrastState } from '../../../data/store/selectors/uiState.selectors';
import { calculateOpCongestionColor } from '../../../utils/DrawingAPI';

import Collapsible from '../Collapsible';

import QueueIconPlus from '../../../main/assets/QueueIconPlus';
import QueueIconMinus from '../../../main/assets/QueueIconMinus';
import { GraphOnChipContext } from '../../../data/GraphOnChipContext';
import LinkCongestionControl from './LinkCongestionControl';

export const CongestionControls: FC = () => {
    const { getActiveGraphOnChip, getActiveGraphName } = useContext(GraphOnChipContext);
    const graphOnChip = getActiveGraphOnChip();
    const graphName = getActiveGraphName();

    const maxBwLimitedFactor = graphOnChip?.details.maxBwLimitedFactor || 10;
    const hasPipes = graphOnChip?.hasPipes || false;

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
                onChange={(value: number) => dispatch(updateOperationPerformanceThreshold(value))}
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
                            <Tooltip2 content='Select all pipes'>
                                <Button icon={IconNames.FILTER_OPEN} onClick={() => dispatch(selectAllPipes())} />
                            </Tooltip2>
                            &nbsp;
                            <Tooltip2 content='Deselect all pipes'>
                                <Button icon={IconNames.FILTER_REMOVE} onClick={() => dispatch(clearAllPipes())} />
                            </Tooltip2>
                        </div>
                        <hr />
                        <div>
                            <Tooltip2 content='Select all operations for active graph'>
                                <Button
                                    icon={IconNames.CUBE_ADD}
                                    onClick={() => dispatch(selectAllOperationsForGraph(graphName))}
                                />
                            </Tooltip2>
                            &nbsp;
                            <Tooltip2 content='Deselect all operations for active graph'>
                                <Button
                                    icon={IconNames.CUBE_REMOVE}
                                    onClick={() => dispatch(clearAllOperationsForGraph(graphName))}
                                />
                            </Tooltip2>
                        </div>
                        <hr />
                        <div>
                            <Tooltip2 content='Select all queues for active graph'>
                                <Button
                                    icon={<QueueIconPlus />}
                                    onClick={() => dispatch(selectAllQueuesForGraph(graphName))}
                                />
                            </Tooltip2>
                            &nbsp;
                            <Tooltip2 content='Deselect all queues for active graph'>
                                <Button
                                    icon={<QueueIconMinus />}
                                    onClick={() => dispatch(clearAllQueuesforGraph(graphName))}
                                />
                            </Tooltip2>
                        </div>
                        <hr />
                    </>
                </Collapsible>
            )}
        </>
    );
};

export default CongestionControls;
