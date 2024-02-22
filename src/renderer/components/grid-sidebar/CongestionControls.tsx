import React, { FC, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Position, Slider, Switch } from '@blueprintjs/core';
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
    clearAllOperations,
    clearAllQueues,
    selectAllOperations,
    selectAllQueues,
} from '../../../data/store/slices/nodeSelection.slice';
import { getHighContrastState } from '../../../data/store/selectors/uiState.selectors';
import { calculateLinkCongestionColor, calculateOpCongestionColor } from '../../../utils/DrawingAPI';
import DataSource, { GridContext } from '../../../data/DataSource';
import { NOC } from '../../../data/Types';
import {
    getLinkSaturation,
    getShowLinkSaturation,
    getShowNOC0,
    getShowNOC1,
} from '../../../data/store/selectors/linkSaturation.selectors';
import Collapsible from '../Collapsible';
import {
    updateLinkSaturation,
    updateShowLinkSaturation,
    updateShowNOC,
} from '../../../data/store/slices/linkSaturation.slice';
import QueueIconPlus from '../../../main/assets/QueueIconPlus';
import QueueIconMinus from '../../../main/assets/QueueIconMinus';

export const CongestionControls: FC = () => {
    const { chip } = useContext<GridContext>(DataSource);
    const maxBwLimitedFactor = chip?.details.maxBwLimitedFactor || 10;
    const hasPipes = chip?.hasPipes || false;

    const dispatch = useDispatch();

    const linkSaturationTreshold = useSelector(getLinkSaturation);
    const showLinkSaturation = useSelector(getShowLinkSaturation);
    const operationPerformanceTreshold = useSelector(getOperationPerformanceTreshold);

    const showOperationPerformanceGrid = useSelector(getShowOperationPerformanceGrid);
    const showNOC0 = useSelector(getShowNOC0);
    const showNOC1 = useSelector(getShowNOC1);

    const isHC: boolean = useSelector(getHighContrastState);

    const congestionLegendStyle = {
        background: `linear-gradient(to right, ${calculateLinkCongestionColor(
            0,
            0,
            isHC,
        )}, ${calculateLinkCongestionColor(50, 0, isHC)}, ${calculateLinkCongestionColor(120, 0, isHC)})`,
    };

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
                    {
                        <>
                            {/* Link saturation */}
                            <Tooltip2 content='Show link congestion' position={Position.RIGHT}>
                                <Switch
                                    checked={showLinkSaturation}
                                    label='link congestion'
                                    onChange={(event) =>
                                        dispatch(updateShowLinkSaturation(event.currentTarget.checked))
                                    }
                                />
                            </Tooltip2>
                            <Switch
                                disabled={!showLinkSaturation}
                                checked={showNOC0}
                                label='noc0'
                                onChange={(event) =>
                                    dispatch(
                                        updateShowNOC({
                                            noc: NOC.NOC0,
                                            selected: event.currentTarget.checked,
                                        }),
                                    )
                                }
                            />
                            <Switch
                                disabled={!showLinkSaturation}
                                checked={showNOC1}
                                label='noc1'
                                onChange={(event) =>
                                    dispatch(
                                        updateShowNOC({
                                            noc: NOC.NOC1,
                                            selected: event.currentTarget.checked,
                                        }),
                                    )
                                }
                            />
                            <div
                                className='congestion-legend'
                                style={{ ...(showLinkSaturation ? congestionLegendStyle : null) }}
                            />
                            <Slider
                                className='link-saturation-slider'
                                min={0}
                                max={125}
                                disabled={!showLinkSaturation}
                                labelStepSize={50}
                                value={linkSaturationTreshold}
                                onChange={(value: number) => dispatch(updateLinkSaturation(value))}
                                labelRenderer={(value) => `${value.toFixed(0)}`}
                            />
                            <hr />
                            <div>
                                <Tooltip2 content='Select all Pipes'>
                                    <Button icon={IconNames.FILTER_OPEN} onClick={() => dispatch(selectAllPipes())} />
                                </Tooltip2>
                                &nbsp;
                                <Tooltip2 content='Clear all Pipes'>
                                    <Button icon={IconNames.FILTER_REMOVE} onClick={() => dispatch(clearAllPipes())} />
                                </Tooltip2>
                            </div>
                            <hr />
                            <div>
                                <Tooltip2 content='Select all Operations'>
                                    <Button icon={IconNames.CUBE_ADD} onClick={() => dispatch(selectAllOperations())} />
                                </Tooltip2>
                                &nbsp;
                                <Tooltip2 content='Clear all Operations'>
                                    <Button
                                        icon={IconNames.CUBE_REMOVE}
                                        onClick={() => dispatch(clearAllOperations())}
                                    />
                                </Tooltip2>
                            </div>
                            <hr />
                            <div>
                                <Tooltip2 content='Select all Queues'>
                                    <Button icon={<QueueIconPlus />} onClick={() => dispatch(selectAllQueues())} />
                                </Tooltip2>
                                &nbsp;
                                <Tooltip2 content='Clear all Queues'>
                                    <Button icon={<QueueIconMinus />} onClick={() => dispatch(clearAllQueues())} />
                                </Tooltip2>
                            </div>
                            <hr />
                        </>
                    }
                </Collapsible>
            )}
        </>
    );
};

export default CongestionControls;
