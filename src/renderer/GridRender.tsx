import React, {useContext, useEffect, useRef, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import * as d3 from 'd3';
import {Position, RangeSlider, Slider, Switch} from '@blueprintjs/core';
import {Tooltip2} from '@blueprintjs/popover2';

import DataSource, {SVGContext} from '../data/DataSource';
import {ComputeNode, LinkDirection} from '../data/DataStructures';
import {getGroupColor} from '../data/ColorGenerator';
import {calculateIntensity, drawLink, drawNOC, drawSelections, NOC_CONFIGURATION, NODE_SIZE} from '../utils/DrawingAPI';
import {PipeSelection, RootState, selectNodeSelectionById, updateLinkSatuation, updateNodeSelection, updateShowLinkSaturation} from '../data/store';

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
                    min={0}
                    max={100}
                    disabled={!showLinkSaturation}
                    labelStepSize={25}
                    value={linkSaturationTreshold}
                    onChange={onLinkSaturationChange}
                    labelRenderer={(value) => `${value.toFixed(0)}`}
                />
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

interface NodeComponentProps {
    node: ComputeNode;
    showEmptyLinks: boolean;
    showOperationColors: boolean;
    showNodeLocation: boolean;
    showLinkSaturation: boolean;
    linkSaturationTreshold: number;
}

const NodeComponent: React.FC<NodeComponentProps> = ({
    node,
    showEmptyLinks,
    showOperationColors,
    showNodeLocation,
    showLinkSaturation,
    linkSaturationTreshold,
    //
}) => {
    const svgRef = useRef<SVGSVGElement | null>(null);
    const allPipes = useSelector((state: RootState) => state.pipeSelection.pipes);
    const dispatch = useDispatch();
    const nodeState = useSelector((state: RootState) => selectNodeSelectionById(state, node.uid));
    const selectedPipeIds = Object.values(allPipes)
        .filter((pipe: PipeSelection) => pipe.selected)
        .map((pipe: PipeSelection) => pipe.id);

    useEffect(() => {
        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();
        if (showEmptyLinks) {
            drawLink(svg, LinkDirection.NOC1_NORTH_OUT);
            drawLink(svg, LinkDirection.NOC0_NORTH_IN);
            drawLink(svg, LinkDirection.NOC1_SOUTH_IN);
            drawLink(svg, LinkDirection.NOC0_SOUTH_OUT);
            drawLink(svg, LinkDirection.NOC1_EAST_IN);
            drawLink(svg, LinkDirection.NOC0_EAST_OUT);
            drawLink(svg, LinkDirection.NOC0_WEST_IN);
            drawLink(svg, LinkDirection.NOC1_WEST_OUT);
            drawLink(svg, LinkDirection.NOC1_OUT);
            drawLink(svg, LinkDirection.NOC0_OUT);
            drawLink(svg, LinkDirection.NOC0_IN);
            drawLink(svg, LinkDirection.NOC1_IN);
        }

        if (showLinkSaturation) {
            node.links.forEach((link) => {
                if (link.linkSaturation >= linkSaturationTreshold) {
                    drawLink(svg, link.direction, calculateIntensity(link.linkSaturation, linkSaturationTreshold), 5);
                }
            });
        }

        let noc0numPipes = 0;
        let noc1numPipes = 0;
        noc0numPipes += drawSelections(svg, LinkDirection.NOC0_EAST_OUT, node, selectedPipeIds);
        noc0numPipes += drawSelections(svg, LinkDirection.NOC0_WEST_IN, node, selectedPipeIds);
        noc0numPipes += drawSelections(svg, LinkDirection.NOC0_SOUTH_OUT, node, selectedPipeIds);
        noc0numPipes += drawSelections(svg, LinkDirection.NOC0_NORTH_IN, node, selectedPipeIds);
        noc0numPipes += drawSelections(svg, LinkDirection.NOC0_IN, node, selectedPipeIds);
        noc0numPipes += drawSelections(svg, LinkDirection.NOC0_OUT, node, selectedPipeIds);

        noc1numPipes += drawSelections(svg, LinkDirection.NOC1_NORTH_OUT, node, selectedPipeIds);
        noc1numPipes += drawSelections(svg, LinkDirection.NOC1_SOUTH_IN, node, selectedPipeIds);
        noc1numPipes += drawSelections(svg, LinkDirection.NOC1_WEST_OUT, node, selectedPipeIds);
        noc1numPipes += drawSelections(svg, LinkDirection.NOC1_EAST_IN, node, selectedPipeIds);
        noc1numPipes += drawSelections(svg, LinkDirection.NOC1_IN, node, selectedPipeIds);
        noc1numPipes += drawSelections(svg, LinkDirection.NOC1_OUT, node, selectedPipeIds);

        if (noc0numPipes > 0) {
            drawNOC(svg, NOC_CONFIGURATION.noc0);
        }
        if (noc1numPipes > 0) {
            drawNOC(svg, NOC_CONFIGURATION.noc1);
        }

        //
    }, [svgRef, selectedPipeIds]);
    const triggerSelection = () => {
        dispatch(updateNodeSelection({id: node.uid, selected: !nodeState.selected}));
    };

    const borderColorStyles = nodeState.selected ? {borderColor: getGroupColor(node.opName)} : {};
    return (
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events
        <div className={`node-item  ${nodeState.selected ? 'selected' : ''}`} style={borderColorStyles} onClick={triggerSelection}>
            <div className={`node-type-label node-type-${node.getNodeLabel()}`}>{node.getNodeLabel()}</div>
            <svg className="node-svg" ref={svgRef} width={NODE_SIZE} height={NODE_SIZE} />
            {node.opName !== '' && showOperationColors && <div className="op-color-swatch" style={{backgroundColor: getGroupColor(node.opName)}} />}
            {showNodeLocation && (
                <div className="n" style={{position: 'absolute', top: 0, left: '20px'}}>
                    {node.loc.x},{node.loc.y}
                </div>
            )}
        </div>
    );
};
