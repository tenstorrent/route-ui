import { Button, Classes, NumericInput, Position, Slider, Switch } from '@blueprintjs/core';
import { FC } from 'react';
import { Tooltip2 } from '@blueprintjs/popover2';
import { useDispatch, useSelector } from 'react-redux';
import { IconNames } from '@blueprintjs/icons';
import {
    updateDetailedViewZoom,
    updateGridZoom,
    updateLinkSaturation,
    updateShowEmptyLinks,
    updateShowLinkSaturation,
    updateShowLinkSaturationForNOC,
    updateShowNodeLocation,
    updateShowOperationColors,
    updateTotalOPs,
} from 'data/store/slices/linkSaturation.slice';
import Collapsible from './Collapsible';
import { CLKBandwidthControls } from './CLKBandwidthControls';
import {
    getOperationPerformanceTreshold,
    getShowOperationPerformanceGrid,
} from '../../data/store/selectors/operationPerf.selectors';
import { updateShowOperationPerformanceGrid } from '../../data/store/slices/operationPerf.slice';
import { clearAllPipes, selectAllPipes } from '../../data/store/slices/pipeSelection.slice';
import { clearAllOperations } from '../../data/store/slices/nodeSelection.slice';
import {
    getDetailedViewZoom,
    getGridZoom,
    getLinkSaturation,
    getShowEmptyLinks,
    getShowLinkSaturation,
    getShowLinkSaturationNOC0,
} from '../../data/store/selectors/linkSaturation.selectors';
import { NOC } from '../../data/Types';
import { getHighContrastState } from '../../data/store/selectors/uiState.selectors';
import { calculateLinkCongestionColor, calculateOpCongestionColor } from '../../utils/DrawingAPI';

export const GridSidebar: FC = () => {
    const dispatch = useDispatch();
    const linkSaturationTreshold = useSelector(getLinkSaturation);
    const showLinkSaturation = useSelector(getShowLinkSaturation);

    const showLinkSaturationNOC0 = useSelector(getShowLinkSaturationNOC0);
    const showLinkSaturationNOC1 = useSelector(getShowLinkSaturationNOC0);

    const detailedViewZoom = useSelector(getDetailedViewZoom);
    const gridZoom = useSelector(getGridZoom);

    const showEmptyLinks = useSelector(getShowEmptyLinks);
    const showOperationColors = useSelector(getShowOperationPerformanceGrid);
    const showNodeLocation = useSelector(getShowOperationPerformanceGrid);

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
        <div className='inner-sidebar'>
            <div className='inner-sidebar-wrap'>
                {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                <label htmlFor='detailedViewZoom'>Detailed view zoom</label>
                <Slider
                    id='detailedViewZoom'
                    min={0.5}
                    max={1}
                    stepSize={0.1}
                    labelStepSize={1}
                    value={detailedViewZoom}
                    onChange={(value: number) => dispatch(updateDetailedViewZoom(value))}
                    labelRenderer={(value) => `${value.toFixed(1)}`}
                />

                {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                <label htmlFor='gridZoom'>Zoom</label>
                <Slider
                    min={0.5}
                    max={3}
                    id='gridZoom'
                    stepSize={0.25}
                    labelStepSize={1}
                    value={gridZoom}
                    onChange={(value: number) => dispatch(updateGridZoom(value))}
                    labelRenderer={(value) => `${value.toFixed(1)}`}
                />
                <hr />
                {/* {chip?.hasPipes && ( */}
                {/*     <> */}
                {/*         <Tooltip2 content='Show pipes' position={Position.RIGHT}> */}
                {/*             <Switch */}
                {/*                 checked={showPipes} */}
                {/*                 label='pipes' */}
                {/*                 onChange={(event) => setShowPipes(event.currentTarget.checked)} */}
                {/*             /> */}
                {/*         </Tooltip2> */}
                {/*         <hr /> */}
                {/*     </> */}
                {/* )} */}
                <Collapsible
                    contentStyles={{
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                    label='Grid Controls'
                    isOpen={false}
                >
                    <>
                        <Tooltip2 content='Show all links overlay' position={Position.RIGHT}>
                            <Switch
                                checked={showEmptyLinks}
                                label='links'
                                onChange={(event) => dispatch(updateShowEmptyLinks(event.currentTarget.checked))}
                            />
                        </Tooltip2>
                        <Tooltip2 content='Show all operations colors' position={Position.RIGHT}>
                            <Switch
                                checked={showOperationColors}
                                label='operations'
                                onChange={(event) => dispatch(updateShowOperationColors(event.currentTarget.checked))}
                            />
                        </Tooltip2>
                        <Tooltip2 content='Show Compute Node locations' position={Position.RIGHT}>
                            <Switch
                                checked={showNodeLocation}
                                label='location'
                                onChange={(event) => dispatch(updateShowNodeLocation(event.currentTarget.checked))}
                            />
                        </Tooltip2>
                        <hr />
                    </>
                </Collapsible>

                <Switch
                    // checked={getShowOperationPerformanceGrid(useSelector((state: RootState) => state))}
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
                    onChange={onOpCongestionChange}
                    labelRenderer={(value) => `${value.toFixed(0)}`}
                />
                <hr />

                {chip?.hasPipes && (
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
                                    checked={showLinkSaturationNOC0}
                                    label='noc0'
                                    onChange={(event) =>
                                        dispatch(
                                            updateShowLinkSaturationForNOC({
                                                noc: NOC.NOC0,
                                                selected: event.currentTarget.checked,
                                            }),
                                        )
                                    }
                                />
                                <Switch
                                    disabled={!showLinkSaturation}
                                    checked={showLinkSaturationNOC1}
                                    label='noc1'
                                    onChange={(event) =>
                                        dispatch(
                                            updateShowLinkSaturationForNOC({
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
                <Collapsible label='CLK Controls' isOpen>
                    {
                        <>
                            {/* TODO: abstract this into a global state */}

                            {opCycles !== 0 && (
                                <>
                                    <div>
                                        {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                                        <label
                                            className={Classes.LABEL}
                                            htmlFor='opCyclesInput'
                                            style={{ marginBottom: '5px' }}
                                        >
                                            AICLK cycles/input
                                        </label>
                                        <NumericInput
                                            //
                                            id='opCyclesInput'
                                            value={opCycles}
                                            stepSize={10000}
                                            minorStepSize={100}
                                            majorStepSize={100000}
                                            min={1}
                                            onValueChange={(value) => {
                                                if (value === 0) {
                                                    return;
                                                }
                                                if (Number.isNaN(value)) {
                                                    return;
                                                }
                                                setOpCycles(value);
                                                dispatch(updateTotalOPs(value));
                                            }}
                                            rightElement={
                                                <Tooltip2 content='Reset Total OP Cycles'>
                                                    <Button
                                                        minimal
                                                        onClick={() => {
                                                            const resetValue = chip?.totalOpCycles || 0;
                                                            setOpCycles(resetValue);
                                                            dispatch(updateTotalOPs(resetValue));
                                                        }}
                                                        icon={IconNames.RESET}
                                                    />
                                                </Tooltip2>
                                            }
                                        />
                                    </div>
                                    <hr />
                                </>
                            )}
                            <CLKBandwidthControls />
                        </>
                    }
                </Collapsible>
            </div>
        </div>
    );
};

export default GridSidebar;
