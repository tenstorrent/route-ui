import React, {useContext, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Button, Position, Slider, Switch} from '@blueprintjs/core';
import {Tooltip2} from '@blueprintjs/popover2';
import {IconNames} from '@blueprintjs/icons';
import DataSource, {SVGContext} from '../data/DataSource';
import {calculateLinkCongestionColor, NODE_SIZE} from '../utils/DrawingAPI';
import {clearAllOperations, clearAllPipes, RootState, selectAllPipes, updateLinkSatuation, updateShowLinkSaturation} from '../data/store';
import NodeComponent from './NodeComponent';
import {ComputeNode} from '../data/DataStructures';
import DetailedView from './components/DetailedView';

export default function GridRender() {
    const {svgData} = useContext<SVGContext>(DataSource);
    const [showEmptyLinks, setShowEmptyLinks] = useState(false);
    const [showPipes, setShowPipes] = useState(true);
    const [showOperationColors, setShowOperationColors] = useState(false);
    const [showNodeLocation, setShowNodeLocation] = useState(false);
    const [gridZoom, setGridZoom] = useState(1);
    const [showLinkSaturation, setShowLinkSaturation] = useState(false);
    const [linkSaturationTreshold, setLinkSaturationTreshold] = useState<number>(75);
    const [detailedViewZoom, setDetailedViewZoom] = useState<number>(1);

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
                <Tooltip2 content="Clear all selected pipes">
                    <Button icon={IconNames.FILTER_OPEN} onClick={() => dispatch(selectAllPipes())}>
                        Select all pipes
                    </Button>
                </Tooltip2>
                <Tooltip2 content="Clear all selected pipes">
                    <Button icon={IconNames.FILTER_REMOVE} onClick={() => dispatch(clearAllPipes())}>
                        Deselect pipes
                    </Button>
                </Tooltip2>
                <hr />
                <Tooltip2 content="Deselect all operations">
                    <Button icon={IconNames.CUBE_REMOVE} onClick={() => dispatch(clearAllOperations())}>
                        Deselect ops
                    </Button>
                </Tooltip2>
                <hr />
            </div>
            {svgData && (
                <div className={`grid-container ${showPipes ? '' : 'pipes-hidden'}`}>
                    <div className="node-container" style={{zoom: `${gridZoom}`, gridTemplateColumns: `repeat(${svgData.totalCols + 1}, ${NODE_SIZE}px)`}}>
                        {svgData.nodes.map((node: ComputeNode) => {
                            return (
                                <NodeComponent
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
