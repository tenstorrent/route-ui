import React, {useContext, useState} from 'react';
import {useDispatch} from 'react-redux';
import {Button, Position, Slider, Switch, Tooltip} from '@blueprintjs/core';
import {Tooltip2} from '@blueprintjs/popover2';

import {IconNames} from '@blueprintjs/icons';
import DataSource, {SVGContext} from '../data/DataSource';
import {NODE_SIZE} from '../utils/DrawingAPI';
import {clearAllOperations, clearAllPipes, updateLinkSatuation, updateShowLinkSaturation} from '../data/store';
import NodeComponent from './NodeComponent';

export default function GridRender() {
    const {svgData} = useContext<SVGContext>(DataSource);
    const [showEmptyLinks, setShowEmptyLinks] = useState(false);
    const [showPipes, setShowPipes] = useState(true);
    const [showOperationColors, setShowOperationColors] = useState(false);
    const [showNodeLocation, setShowNodeLocation] = useState(false);
    const [gridZoom, setGridZoom] = useState(1);
    const [showLinkSaturation, setShowLinkSaturation] = useState(false);
    const [linkSaturationTreshold, setLinkSaturationTreshold] = useState<number>(75);

    const dispatch = useDispatch();

    const onLinkSaturationChange = (value: number) => {
        setLinkSaturationTreshold(value);
        dispatch(updateLinkSatuation(value));
    };
    const onShowLinkSaturation = (value: boolean) => {
        setShowLinkSaturation(value);
        dispatch(updateShowLinkSaturation(value));
    };
    const clearAllSelectedPipes = () => {
        dispatch(clearAllPipes());
    };
    return (
        <>
            <div className="inner-sidebar">
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
                <Tooltip content="Clear all selected pipes">
                    <Button icon={IconNames.FILTER_REMOVE} onClick={() => dispatch(clearAllPipes())}>
                        Clear pipes
                    </Button>
                </Tooltip>
                <hr />
                <Tooltip content="Decelect all operations">
                    <Button icon={IconNames.CUBE_REMOVE} onClick={() => dispatch(clearAllOperations())}>
                        Clear ops
                    </Button>
                </Tooltip>
                <hr />
            </div>
            <div className={`grid-container ${showPipes ? '' : 'pipes-hidden'}`}>
                <div className="node-container" style={{zoom: `${gridZoom}`, gridTemplateColumns: `repeat(${svgData.totalCols + 1}, ${NODE_SIZE}px)`}}>
                    {svgData.nodes.map((node, index) => {
                        return (
                            <NodeComponent
                                node={node}
                                showEmptyLinks={showEmptyLinks}
                                showNodeLocation={showNodeLocation}
                                showOperationColors={showOperationColors}
                                showLinkSaturation={showLinkSaturation}
                                linkSaturationTreshold={linkSaturationTreshold}
                                key={index}
                            />
                        );
                    })}
                </div>
            </div>
        </>
    );
}
