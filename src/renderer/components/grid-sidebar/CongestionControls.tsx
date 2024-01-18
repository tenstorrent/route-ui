import { FC, useContext } from 'react';
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
import { clearAllOperations } from '../../../data/store/slices/nodeSelection.slice';
import {
    getHighContrastState,
    getShowLinkSaturation,
    getShowNOC0,
    getShowNOC1,
} from '../../../data/store/selectors/uiState.selectors';
import { calculateLinkCongestionColor, calculateOpCongestionColor } from '../../../utils/DrawingAPI';
import DataSource, { GridContext } from '../../../data/DataSource';
import { NOC } from '../../../data/Types';
import { getLinkSaturation } from '../../../data/store/selectors/linkSaturation.selectors';
import Collapsible from '../Collapsible';
import { updateLinkSaturation } from '../../../data/store/slices/linkSaturation.slice';
import { updateShowLinkSaturation, updateShowNOC } from '../../../data/store/slices/uiState.slice';

export const CongestionControls: FC = () => {
    const { chip } = useContext<GridContext>(DataSource);
    const maxBwLimitedFactor = chip?.details.maxBwLimitedFactor || 10;
    const hasPipes = chip?.hasPipes || false;

    const dispatch = useDispatch();

    const linkSaturationTreshold = useSelector(getLinkSaturation);
    const showLinkSaturation = useSelector(getShowLinkSaturation);

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
                checked={useSelector(getShowOperationPerformanceGrid)}
                label='Op Perf'
                onChange={(event) => dispatch(updateShowOperationPerformanceGrid(event.currentTarget.checked))}
            />
            <div
                className='congestion-legend'
                style={{
                    ...(useSelector(getShowOperationPerformanceGrid) ? opCongestionLegendStyle : null),
                    width: '100%',
                    height: '3px',
                }}
            />
            <Slider
                className='link-saturation-slider'
                min={0}
                max={maxBwLimitedFactor || 10}
                disabled={!useSelector(getShowOperationPerformanceGrid)}
                labelStepSize={Math.max(5, maxBwLimitedFactor / 5)}
                value={useSelector(getOperationPerformanceTreshold)}
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
                                style={{
                                    ...(showLinkSaturation ? congestionLegendStyle : null),
                                    width: '100%',
                                    height: '3px',
                                }}
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

                            <Tooltip2 content='Select all pipes'>
                                <Button icon={IconNames.FILTER_OPEN} onClick={() => dispatch(selectAllPipes())}>
                                    Select all pipes
                                </Button>
                            </Tooltip2>
                            <Tooltip2 content='Clear all pipes selection'>
                                <Button icon={IconNames.FILTER_REMOVE} onClick={() => dispatch(clearAllPipes())}>
                                    Deselect pipes
                                </Button>
                            </Tooltip2>
                            <hr />
                            <Tooltip2 content='Clear all operation selection'>
                                <Button icon={IconNames.CUBE_REMOVE} onClick={() => dispatch(clearAllOperations())}>
                                    Deselect ops
                                </Button>
                            </Tooltip2>
                            <hr />
                        </>
                    }
                </Collapsible>
            )}
        </>
    );
};

export default CongestionControls;
