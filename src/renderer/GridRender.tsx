import React, {useContext, useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Button, Classes, Icon, InputGroup, NumericInput, Position, Slider, Switch} from '@blueprintjs/core';
import {Tooltip2} from '@blueprintjs/popover2';
import {IconNames} from '@blueprintjs/icons';
import {svg} from 'd3';
import DataSource, {GridContext} from '../data/DataSource';
import {calculateLinkCongestionColor, NODE_SIZE} from '../utils/DrawingAPI';
import {clearAllOperations, clearAllPipes, RootState, selectAllPipes, updateLinkSatuation, updateShowLinkSaturation, updateTotalOPs} from '../data/store';
import NodeGridElement from './components/NodeGridElement';
import {ComputeNode} from '../data/Chip';
import DetailedView from './components/DetailedView';
import {LINK_SATURATION_INITIAIL_VALUE} from '../data/constants';

export default function GridRender() {
    const {chip, setChip} = useContext<GridContext>(DataSource);
    const [showEmptyLinks, setShowEmptyLinks] = useState(false);
    const [showPipes, setShowPipes] = useState(true);
    const [showOperationColors, setShowOperationColors] = useState(false);
    const [showNodeLocation, setShowNodeLocation] = useState(false);
    const [gridZoom, setGridZoom] = useState(1);
    const [showLinkSaturation, setShowLinkSaturation] = useState(false);
    const [linkSaturationTreshold, setLinkSaturationTreshold] = useState<number>(LINK_SATURATION_INITIAIL_VALUE);
    const [detailedViewZoom, setDetailedViewZoom] = useState<number>(1);
    const [opCycles, setOpCycles] = useState<number>(0);

    const isHC = useSelector((state: RootState) => state.highContrast.enabled);
    const dispatch = useDispatch();

    const onLinkSaturationChange = (value: number) => {
        setLinkSaturationTreshold(value);
        dispatch(updateLinkSatuation(value));
    };
    const onShowLinkSaturation = (value: boolean) => {
        setShowLinkSaturation(value);
        dispatch(updateShowLinkSaturation(value));
    };

    const congestionLegendStyle = {
        background: `linear-gradient(to right, ${calculateLinkCongestionColor(0, 0, isHC)}, ${calculateLinkCongestionColor(50, 0, isHC)}, ${calculateLinkCongestionColor(
            120,
            0,
            isHC
        )})`,
    };

    useEffect(() => {
        if (chip) {
            setOpCycles(chip.totalOpCycles);
        }
    }, [chip]);

    return (
        <>
            <div className="inner-sidebar">
                Detailed view zoom
                <Slider
                    min={0.5}
                    max={1}
                    stepSize={0.1}
                    labelStepSize={1}
                    value={detailedViewZoom}
                    onChange={(value: number) => setDetailedViewZoom(value)}
                    labelRenderer={(value) => `${value.toFixed(1)}`}
                />
                Zoom
                <Slider
                    min={0.5}
                    max={3}
                    stepSize={0.25}
                    labelStepSize={1}
                    value={gridZoom}
                    onChange={(value: number) => setGridZoom(value)}
                    labelRenderer={(value) => `${value.toFixed(1)}`}
                />
                <hr />
                <Tooltip2 content="Show pipes" position={Position.RIGHT}>
                    <Switch checked={showPipes} label="pipes" onChange={(event) => setShowPipes(event.currentTarget.checked)} />
                </Tooltip2>
                <hr />
                <Tooltip2 content="Show all links overlay" position={Position.RIGHT}>
                    <Switch checked={showEmptyLinks} label="links" disabled={!showPipes} onChange={(event) => setShowEmptyLinks(event.currentTarget.checked)} />
                </Tooltip2>
                <Tooltip2 content="Show all operations colors" position={Position.RIGHT}>
                    <Switch checked={showOperationColors} label="operations" onChange={(event) => setShowOperationColors(event.currentTarget.checked)} />
                </Tooltip2>
                <Tooltip2 content="Show Compute Node locations" position={Position.RIGHT}>
                    <Switch checked={showNodeLocation} label="location" onChange={(event) => setShowNodeLocation(event.currentTarget.checked)} />
                </Tooltip2>
                <hr />
                {/* Link saturation */}
                <Tooltip2 content="Show link congestion" position={Position.RIGHT}>
                    <Switch checked={showLinkSaturation} label="congestion" onChange={(event) => onShowLinkSaturation(event.currentTarget.checked)} />
                </Tooltip2>
                <div className="congestion-legend" style={{...(showLinkSaturation ? congestionLegendStyle : null), width: '100%', height: '3px'}} />
                <Slider
                    className="link-saturation-slider"
                    min={0}
                    max={125}
                    disabled={!showLinkSaturation}
                    labelStepSize={50}
                    value={linkSaturationTreshold}
                    onChange={onLinkSaturationChange}
                    labelRenderer={(value) => `${value.toFixed(0)}`}
                />
                <hr />
                <Tooltip2 content="Select all pipes">
                    <Button icon={IconNames.FILTER_OPEN} onClick={() => dispatch(selectAllPipes())}>
                        Select all pipes
                    </Button>
                </Tooltip2>
                <Tooltip2 content="Clear all pipes selection">
                    <Button icon={IconNames.FILTER_REMOVE} onClick={() => dispatch(clearAllPipes())}>
                        Deselect pipes
                    </Button>
                </Tooltip2>
                <hr />
                <Tooltip2 content="Clear all operation selection">
                    <Button icon={IconNames.CUBE_REMOVE} onClick={() => dispatch(clearAllOperations())}>
                        Deselect ops
                    </Button>
                </Tooltip2>
                <hr />
                <div>
                    <label className={Classes.LABEL} htmlFor="opCyclesInput" style={{marginBottom: '5px'}}>
                        Update Total OP Cycles
                    </label>
                    <NumericInput
                        //
                        id="opCyclesInput"
                        value={opCycles}
                        stepSize={10000}
                        minorStepSize={100}
                        majorStepSize={100000}
                        min={0}
                        onValueChange={(value) => {
                            setOpCycles(value);
                            dispatch(updateTotalOPs(value));
                        }}
                        rightElement={
                            <Tooltip2 content="Reset Total OP Cycles">
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
            </div>
            {chip && (
                <div className={`grid-container ${showPipes ? '' : 'pipes-hidden'}`}>
                    <div className="node-container" style={{zoom: `${gridZoom}`, gridTemplateColumns: `repeat(${chip.totalCols + 1}, ${NODE_SIZE}px)`}}>
                        {chip.nodes.map((node: ComputeNode) => {
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
                        })}
                    </div>
                </div>
            )}
            <DetailedView showLinkSaturation={showLinkSaturation} zoom={detailedViewZoom} linkSaturationTreshold={linkSaturationTreshold} />
        </>
    );
}
