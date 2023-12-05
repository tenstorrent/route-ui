import React, { useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Classes, NumericInput, Position, Slider, Switch } from '@blueprintjs/core';
import { Tooltip2 } from '@blueprintjs/popover2';
import { IconNames } from '@blueprintjs/icons';
import {
    updateLinkSaturation,
    updateShowLinkSaturation,
    updateShowLinkSaturationForNOC,
    updateTotalOPs,
    updateCLK,
    updateDRAMBandwidth,
    updatePCIBandwidth,
} from 'data/store/slices/linkSaturation.slice';
import { clearAllOperations } from 'data/store/slices/nodeSelection.slice';
import { selectAllPipes, clearAllPipes, updateFocusPipe } from 'data/store/slices/pipeSelection.slice';
import { RootState } from 'data/store/createStore';
import { getHighContrastState } from 'data/store/selectors/uiState.selectors';

import DataSource, { GridContext } from '../data/DataSource';
import { calculateLinkCongestionColor, NODE_SIZE } from '../utils/DrawingAPI';

import NodeGridElement from './components/NodeGridElement';
import { ComputeNode } from '../data/Chip';
import DetailedView from './components/DetailedView';
import {
    AICLK_INITIAL_MHZ,
    DRAM_BANDWIDTH_INITIAL_GBS,
    LINK_SATURATION_INITIAIL_PERCENT,
    PCIE_BANDWIDTH_INITIAL_GBS,
} from '../data/constants';
import { NOC } from '../data/Types';
import { mapIterable } from '../utils/IterableHelpers';
import Collapsible from './components/Collapsible';
import { Queue } from '../data/GraphTypes';

export default function GridRender() {
    const { chip } = useContext<GridContext>(DataSource);
    const [showEmptyLinks, setShowEmptyLinks] = useState(false);
    const [showOperationColors, setShowOperationColors] = useState(false);
    const [showNodeLocation, setShowNodeLocation] = useState(false);
    const [gridZoom, setGridZoom] = useState(1);
    const [showLinkSaturation, setShowLinkSaturation] = useState(false);
    const [showLinkSaturationNOC0, setShowLinkSaturationNOC0] = useState(true);
    const [showLinkSaturationNOC1, setShowLinkSaturationNOC1] = useState(true);
    const [linkSaturationTreshold, setLinkSaturationTreshold] = useState<number>(LINK_SATURATION_INITIAIL_PERCENT);
    const [detailedViewZoom, setDetailedViewZoom] = useState<number>(1);
    const [opCycles, setOpCycles] = useState<number>(0);

    const isHC = useSelector(getHighContrastState);
    const dispatch = useDispatch();

    const onLinkSaturationChange = (value: number) => {
        setLinkSaturationTreshold(value);
        dispatch(updateLinkSaturation(value));
    };
    const onShowLinkSaturation = (value: boolean) => {
        setShowLinkSaturation(value);
        dispatch(updateShowLinkSaturation(value));
    };

    const onShowLinkSaturationForNOC = (noc: NOC, selected: boolean) => {
        dispatch(updateShowLinkSaturationForNOC({ noc, selected }));
        if (noc === NOC.NOC0) {
            setShowLinkSaturationNOC0(selected);
        }
        if (noc === NOC.NOC1) {
            setShowLinkSaturationNOC1(selected);
        }
    };

    const congestionLegendStyle = {
        background: `linear-gradient(to right, ${calculateLinkCongestionColor(
            0,
            0,
            isHC,
        )}, ${calculateLinkCongestionColor(50, 0, isHC)}, ${calculateLinkCongestionColor(120, 0, isHC)})`,
    };

    // eslint-disable-next-line no-unsafe-optional-chaining
    // console.log(
    //     [...chip?.queues].map((q: Queue) => {
    //         console.log(
    //             q.details?.['allocation-info'].map((info) => info.channel),
    //             `${q.name} ${q.details?.location}`,
    //             q.details?.['allocation-info'],
    //         );
    //     }),
    // );

    useEffect(() => {
        if (chip) {
            setOpCycles(chip.totalOpCycles);
        }
    }, [chip]);

    return (
        <>
            <div className='inner-sidebar'>
                <div className='inner-sidebar-wrap'>
                    <label htmlFor='detailedViewZoom'>Detailed view zoom</label>
                    <Slider
                        id='detailedViewZoom'
                        min={0.5}
                        max={1}
                        stepSize={0.1}
                        labelStepSize={1}
                        value={detailedViewZoom}
                        onChange={(value: number) => setDetailedViewZoom(value)}
                        labelRenderer={(value) => `${value.toFixed(1)}`}
                    />
                    <label htmlFor='gridZoom'>Zoom</label>
                    <Slider
                        min={0.5}
                        max={3}
                        id='gridZoom'
                        stepSize={0.25}
                        labelStepSize={1}
                        value={gridZoom}
                        onChange={(value: number) => setGridZoom(value)}
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
                                    onChange={(event) => setShowEmptyLinks(event.currentTarget.checked)}
                                />
                            </Tooltip2>
                            <Tooltip2 content='Show all operations colors' position={Position.RIGHT}>
                                <Switch
                                    checked={showOperationColors}
                                    label='operations'
                                    onChange={(event) => setShowOperationColors(event.currentTarget.checked)}
                                />
                            </Tooltip2>
                            <Tooltip2 content='Show Compute Node locations' position={Position.RIGHT}>
                                <Switch
                                    checked={showNodeLocation}
                                    label='location'
                                    onChange={(event) => setShowNodeLocation(event.currentTarget.checked)}
                                />
                            </Tooltip2>
                            <hr />
                        </>
                    </Collapsible>
                    {/* TODO: abstract this into a global state */}

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
                                            onChange={(event) => onShowLinkSaturation(event.currentTarget.checked)}
                                        />
                                    </Tooltip2>
                                    <Switch
                                        disabled={!showLinkSaturation}
                                        checked={showLinkSaturationNOC0}
                                        label='noc0'
                                        onChange={(event) =>
                                            onShowLinkSaturationForNOC(NOC.NOC0, event.currentTarget.checked)
                                        }
                                    />
                                    <Switch
                                        disabled={!showLinkSaturation}
                                        checked={showLinkSaturationNOC1}
                                        label='noc1'
                                        onChange={(event) =>
                                            onShowLinkSaturationForNOC(NOC.NOC1, event.currentTarget.checked)
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
                                        onChange={onLinkSaturationChange}
                                        labelRenderer={(value) => `${value.toFixed(0)}`}
                                    />
                                    <hr />

                                    <Tooltip2 content='Select all pipes'>
                                        <Button icon={IconNames.FILTER_OPEN} onClick={() => dispatch(selectAllPipes())}>
                                            Select all pipes
                                        </Button>
                                    </Tooltip2>
                                    <Tooltip2 content='Clear all pipes selection'>
                                        <Button
                                            icon={IconNames.FILTER_REMOVE}
                                            onClick={() => dispatch(clearAllPipes())}
                                        >
                                            Deselect pipes
                                        </Button>
                                    </Tooltip2>
                                    <hr />
                                    <Tooltip2 content='Clear all operation selection'>
                                        <Button
                                            icon={IconNames.CUBE_REMOVE}
                                            onClick={() => dispatch(clearAllOperations())}
                                        >
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

            {chip && (
                <div
                    className='grid-container'
                    // this is to address the issue with focus pipe getting stuck because of Popover2
                    // TODO: find a better solution
                    onMouseEnter={() => {
                        dispatch(updateFocusPipe(null));
                    }}
                >
                    <div
                        className='node-container'
                        style={{
                            zoom: `${gridZoom}`,
                            gridTemplateColumns: `repeat(${chip.totalCols + 1}, ${NODE_SIZE}px)`,
                        }}
                    >
                        {[
                            ...mapIterable(chip.nodes, (node: ComputeNode) => {
                                return (
                                    <NodeGridElement
                                        node={node}
                                        showEmptyLinks={showEmptyLinks}
                                        showNodeLocation={showNodeLocation}
                                        showOperationColors={showOperationColors}
                                        showLinkSaturation={showLinkSaturation}
                                        linkSaturationTreshold={linkSaturationTreshold}
                                        key={node.uid}
                                    />
                                );
                            }),
                        ]}
                    </div>
                </div>
            )}
            <DetailedView zoom={detailedViewZoom} />
        </>
    );
}

interface DRAMBandwidthControlsProps {}

const CLKBandwidthControls: React.FC<DRAMBandwidthControlsProps> = () => {
    const dispatch = useDispatch();
    const dramBandwidth = useSelector((state: RootState) => state.linkSaturation.DRAMBandwidthGBs);
    const clkMHz = useSelector((state: RootState) => state.linkSaturation.CLKMHz);
    const PCIeBandwidth = useSelector((state: RootState) => state.linkSaturation.PCIBandwidthGBs);
    return (
        <>
            <label className={Classes.LABEL} htmlFor='clkMHzInput' style={{ marginBottom: '5px' }}>
                AICLK (MHz)
            </label>
            <NumericInput
                //
                id='clkMHzInput'
                value={clkMHz}
                stepSize={10}
                minorStepSize={1}
                majorStepSize={100}
                min={1}
                onValueChange={(value) => {
                    dispatch(updateCLK(value));
                }}
                rightElement={
                    <Button
                        minimal
                        onClick={() => {
                            dispatch(updateCLK(AICLK_INITIAL_MHZ));
                        }}
                        icon={IconNames.RESET}
                    />
                }
            />
            <br />
            <label className={Classes.LABEL} htmlFor='dramBandwidthInput' style={{ marginBottom: '5px' }}>
                DRAM channel BW (GB/s)
            </label>
            <NumericInput
                //
                id='dramBandwidthInput'
                value={dramBandwidth}
                stepSize={0.5}
                minorStepSize={0.1}
                majorStepSize={10}
                min={0}
                onValueChange={(value) => {
                    dispatch(updateDRAMBandwidth(value));
                }}
                rightElement={
                    <Button
                        minimal
                        onClick={() => {
                            dispatch(updateDRAMBandwidth(DRAM_BANDWIDTH_INITIAL_GBS));
                        }}
                        icon={IconNames.RESET}
                    />
                }
            />
            <br />
            <label className={Classes.LABEL} htmlFor='pcieBandwidthInput' style={{ marginBottom: '5px' }}>
                PCIe channel BW (GB/s)
            </label>
            <NumericInput
                //
                id='pcieBandwidthInput'
                value={PCIeBandwidth}
                stepSize={0.5}
                minorStepSize={0.1}
                majorStepSize={10}
                min={0}
                onValueChange={(value) => {
                    dispatch(updatePCIBandwidth(value));
                }}
                rightElement={
                    <Button
                        minimal
                        onClick={() => {
                            dispatch(updatePCIBandwidth(PCIE_BANDWIDTH_INITIAL_GBS));
                        }}
                        icon={IconNames.RESET}
                    />
                }
            />
        </>
    );
};
