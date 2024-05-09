// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent Inc.

import { Button, Card, Icon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Tooltip2 } from '@blueprintjs/popover2';
import { updateNodeSelection } from 'data/store/slices/nodeSelection.slice';
import { updatePipeSelection } from 'data/store/slices/pipeSelection.slice';
import { openDetailedView } from 'data/store/slices/uiState.slice';
import React, { Fragment, useContext, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { JSX } from 'react/jsx-runtime';
import { GraphVertexType } from '../../../data/GraphNames';
import { ComputeNode, NOCLink, PipeSegment } from '../../../data/GraphOnChip';
import { GraphOnChipContext } from '../../../data/GraphOnChipContext';
import { OperandDirection } from '../../../data/OpPerfDetails';
import { ComputeNodeType, NOCLinkName } from '../../../data/Types';
import { getOrderedSelectedNodeList } from '../../../data/store/selectors/nodeSelection.selectors';
import { getDetailedViewOpenState, getSelectedDetailsViewUID } from '../../../data/store/selectors/uiState.selectors';
import { calculateSlowestOperand, formatNodeUID } from '../../../utils/DataUtils';
import useSelectableGraphVertex from '../../hooks/useSelectableGraphVertex.hook';
import Collapsible from '../Collapsible';
import GraphVertexDetails from '../GraphVertexDetails';
import GraphVertexDetailsSelectables from '../GraphVertexDetailsSelectables';
import LinkDetails from '../LinkDetails';
import SelectableOperation from '../SelectableOperation';
import SelectablePipe from '../SelectablePipe';

interface ComputeNodeProps {
    node: ComputeNode;
    temporalEpoch: number;
    graphName: string;
}

const CoreOperationRuntimeMetrics = (props: { node: ComputeNode }) => {
    const { node } = props;

    if (node.type !== ComputeNodeType.CORE || !node.perfAnalyzerResults) {
        return null;
    }

    const slowestOperandPerformance = calculateSlowestOperand(node.perfAnalyzerResults.slowest_operand);
    const slowestOperand = node.operation?.getOperandByPerformance(slowestOperandPerformance);
    const metrics = node.perfAnalyzerResults.slowestOperandDetails;
    // eslint-disable-next-line no-restricted-globals
    const outOfMemory = isNaN(node.perfAnalyzerResults.model_runtime_per_input);
    const modelRuntimeIcon = (node.opCycles !== node.perfAnalyzerResults.model_runtime_per_input || outOfMemory) && (
        <Tooltip2
            content={
                outOfMemory
                    ? 'Out of memory, using Netlist analyzer data'
                    : `Netlist model estimate of ${node.opCycles.toLocaleString()} does not match perf model estimate`
            }
        >
            <Icon iconSize={11} icon={IconNames.WARNING_SIGN} className={outOfMemory ? 'out-of-memory' : ''} />
        </Tooltip2>
    );

    const modelRuntimeValue = outOfMemory
        ? node.opCycles.toLocaleString()
        : node.perfAnalyzerResults.model_runtime_per_input.toLocaleString();

    let slowestOperandText = 'n/a';

    if (slowestOperand?.name) {
        const actualText = metrics?.actual ? `${metrics.actual} B/ns` : 'n/a';
        const requiredText = metrics?.required ? `${metrics.required} B/ns` : 'n/a';

        slowestOperandText = `${actualText} / ${requiredText}`;
    }

    const runtimeMetrics: [string | JSX.Element, string | number | JSX.Element, string?][] = [
        // TODO: This is only a small subset of all details
        //  - will likely want to add more organization if more details are added here
        //  - it's probably only useful to put heatmap-related values here (once heatmap is implemented),
        //    and leave other details for a drilling-down workflow
        //  - Operand-specific metrics should probably go under each operand?

        [
            'Model Estimate',
            <span className='model-perf-estimate'>
                {modelRuntimeIcon}
                {modelRuntimeValue}
            </span>,
            'cycles',
        ],
        ['Kernel Total Runtime', node.perfAnalyzerResults.kernel_total_runtime.toLocaleString(), 'cycles'],
        ['Bandwidth Limited Factor', node.perfAnalyzerResults.bw_limited_factor],
        [
            'Slowest Operand',
            <div className='slowest-operand-render'>
                {metrics?.type === OperandDirection.OUTPUT && (
                    <Icon size={12} icon={IconNames.EXPORT} title={node.perfAnalyzerResults.slowest_operand} />
                )}
                {metrics?.type === OperandDirection.INPUT && (
                    <Icon size={12} icon={IconNames.IMPORT} title={node.perfAnalyzerResults.slowest_operand} />
                )}
                {slowestOperand?.name ? <span title={slowestOperand?.name}>{slowestOperand?.name}</span> : 'n/a'}
            </div>,
        ],

        ['Math utilisation', node.perfAnalyzerResults.bw_bound_math_utilization, '%'],
        ['BW a / r', slowestOperandText],
    ];
    return (
        <div className='core-runtime-metrics'>
            {runtimeMetrics.map(([label, value, unit]) => (
                <div className='core-runtime-item' key={`${label}-${value}-${unit}`}>
                    <h4 className='core-runtime-label'>{label}:</h4>
                    <span className='core-runtime-value'>
                        {value}
                        {unit !== undefined ? ` ${unit}` : ''}
                    </span>
                </div>
            ))}
        </div>
    );
};

const ComputeNodePropertiesCard = ({ node, temporalEpoch, graphName }: ComputeNodeProps): React.ReactElement => {
    const dispatch = useDispatch();
    const isDetailsViewOpen = useSelector(getDetailedViewOpenState);
    const selectedDetailsViewUID = useSelector(getSelectedDetailsViewUID);
    const { selected, selectOperand, disabledOperand } = useSelectableGraphVertex();

    const updatePipesState = (pipeList: string[], state: boolean) => {
        pipeList.forEach((pipeId) => {
            dispatch(updatePipeSelection({ id: pipeId, selected: state }));
        });
    };

    const inputs = node.operation && [...node.operation.inputs];
    const outputs = node.operation && [...node.operation.outputs];

    const classList = ['node-type', `node-type-${node.getNodeLabel()}`];
    if (node.uid === selectedDetailsViewUID && isDetailsViewOpen) {
        classList.push('detailed-view');
    }
    return (
        <Card className='node-element'>
            <h3 className={classList.join(' ')}>
                <span className='hover-wrapper'>
                    {node.type.toUpperCase()} {formatNodeUID(node.uid)}
                </span>
                <Tooltip2 content='Close ComputeNode'>
                    <Button
                        small
                        icon={IconNames.CROSS}
                        onClick={() => {
                            dispatch(updateNodeSelection({ temporalEpoch, id: node.uid, selected: false }));
                        }}
                    />
                </Tooltip2>
            </h3>
            {node.type === ComputeNodeType.DRAM && (
                <p>
                    Channel {node.dramChannelId}, Sub {node.dramSubchannelId}
                </p>
            )}
            {node.operation && (
                <div className='opname theme-dark'>
                    <div title={node.operation.name}>
                        <SelectableOperation
                            opName={node.operation.name}
                            value={selected(node.operation.name)}
                            selectFunc={selectOperand}
                            stringFilter=''
                        />
                    </div>
                    {node.type === ComputeNodeType.CORE && <CoreOperationRuntimeMetrics node={node} />}
                </div>
            )}

            {node.queueList.length > 0 && (
                <div className='opname theme-dark'>
                    <Collapsible label={<h4>Queues:</h4>} isOpen>
                        {node.queueList.map((queue) => (
                            <Fragment key={queue.name}>
                                <SelectableOperation
                                    disabled={disabledOperand(queue.name)}
                                    opName={queue.name}
                                    value={selected(queue.name)}
                                    selectFunc={selectOperand}
                                    stringFilter=''
                                />
                                <GraphVertexDetails graphNode={queue} showQueueDetails={false} />
                            </Fragment>
                        ))}
                    </Collapsible>
                </div>
            )}
            {node.operation && (
                <div className='opname theme-dark'>
                    {inputs && inputs.length > 0 && (
                        <>
                            <h4 className='io-label'>Inputs:</h4>
                            {inputs.map((operand, index) => (
                                <ul className='scrollable-content' key={operand.name}>
                                    <div title={operand.name}>
                                        <div style={{ fontSize: '12px' }}>
                                            <GraphVertexDetailsSelectables operand={operand} />
                                            {operand.vertexType === GraphVertexType.OPERATION && (
                                                <ul className='scrollable-content'>
                                                    {operand
                                                        .getPipesForOperatorIndexed(node.operation!.name, index)
                                                        .filter((pipeId) =>
                                                            node.getInternalPipeIDsForNode().includes(pipeId),
                                                        )
                                                        .map((pipeId) => (
                                                            <li key={`${operand.name}-${pipeId}`}>
                                                                <SelectablePipe
                                                                    pipeSegment={
                                                                        new PipeSegment(pipeId, 0, NOCLinkName.NONE)
                                                                    }
                                                                    pipeFilter=''
                                                                    showBandwidth={false}
                                                                />
                                                            </li>
                                                        ))}
                                                </ul>
                                            )}
                                            {operand.vertexType === GraphVertexType.QUEUE && (
                                                <ul className=' scrollable-content pipe-ids-for-core'>
                                                    {operand.getPipeIdsForCore(node.uid).map((pipeId) => (
                                                        <li key={`${operand.name}-${pipeId}`}>
                                                            <SelectablePipe
                                                                pipeSegment={
                                                                    new PipeSegment(pipeId, 0, NOCLinkName.NONE)
                                                                }
                                                                pipeFilter=''
                                                                showBandwidth={false}
                                                            />
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    </div>
                                </ul>
                            ))}
                        </>
                    )}
                    {outputs && outputs.length > 0 && (
                        <>
                            <h4 className='io-label'>Outputs:</h4>
                            {outputs.map((operand, index) => (
                                <ul className='scrollable-content' key={operand.name}>
                                    <div title={operand.name}>
                                        <div style={{ fontSize: '12px' }}>
                                            <GraphVertexDetailsSelectables operand={operand} />
                                            {operand.vertexType === GraphVertexType.OPERATION && (
                                                <ul className='scrollable-content'>
                                                    {operand
                                                        .getPipesForOperatorIndexed(node.operation!.name, index)
                                                        .filter((pipeId) =>
                                                            node.getInternalPipeIDsForNode().includes(pipeId),
                                                        )
                                                        .map((pipeId) => (
                                                            <li key={`${operand.name}-${pipeId}`}>
                                                                <SelectablePipe
                                                                    pipeSegment={
                                                                        new PipeSegment(pipeId, 0, NOCLinkName.NONE)
                                                                    }
                                                                    pipeFilter=''
                                                                    showBandwidth={false}
                                                                />
                                                            </li>
                                                        ))}
                                                </ul>
                                            )}
                                            {operand.vertexType === GraphVertexType.QUEUE && (
                                                <ul className='scrollable-content pipe-ids-for-core'>
                                                    {operand.getPipeIdsForCore(node.uid).map((pipeId) => (
                                                        <li key={`${operand.name}-${pipeId}`}>
                                                            <SelectablePipe
                                                                pipeSegment={
                                                                    new PipeSegment(pipeId, 0, NOCLinkName.NONE)
                                                                }
                                                                pipeFilter=''
                                                                showBandwidth={false}
                                                            />
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    </div>
                                </ul>
                            ))}
                        </>
                    )}
                </div>
            )}
            <div className='node-controls'>
                {(node.type === ComputeNodeType.DRAM ||
                    node.type === ComputeNodeType.ETHERNET ||
                    node.type === ComputeNodeType.PCIE) && (
                    <Button
                        small
                        icon={IconNames.PROPERTIES}
                        disabled={node.uid === selectedDetailsViewUID && isDetailsViewOpen}
                        onClick={() => {
                            dispatch(openDetailedView(node.uid));
                        }}
                    >
                        Detailed View
                    </Button>
                )}
                {/* TODO: abstract this into a global state */}
                {/* TODO: controls shoudl disable if node has no pipes and hide if pipe data is not loaded */}
                {node.pipes.length > 0 && (
                    <>
                        <Button
                            small
                            icon={IconNames.FILTER_LIST}
                            onClick={() => updatePipesState(node.getInternalPipeIDsForNode(), true)}
                        >
                            Select internal pipes
                        </Button>
                        <Button
                            small
                            icon={IconNames.FILTER_KEEP}
                            onClick={() => updatePipesState(node.getPipeIdsForNode(), true)}
                        >
                            Select all pipes
                        </Button>
                        <Button
                            small
                            icon={IconNames.FILTER_REMOVE}
                            onClick={() => updatePipesState(node.getPipeIdsForNode(), false)}
                        >
                            Deselect all pipes
                        </Button>
                    </>
                )}
            </div>
            {/* TODO: abstract this into a global state */}
            {node.pipes.length > 0 && (
                <div className='node-links-wrap'>
                    <h4>Links</h4>
                    {node.getNOCLinksForNode().map((link: NOCLink) => (
                        <LinkDetails key={link.name} link={link} graphName={graphName} showEmpty />
                    ))}
                </div>
            )}
        </Card>
    );
};

const ComputeNodesPropertiesTab = ({ epoch, graphName }: { epoch: number; graphName: string }) => {
    const graphList = useContext(GraphOnChipContext).getGraphOnChipListForTemporalEpoch(epoch);
    const orderedNodeSelection = useSelector(getOrderedSelectedNodeList(epoch));
    const selectedNodes = useMemo(() => {
        const selectedNodesList = orderedNodeSelection
            .map((nodeState) => {
                const graphOnChip = graphList[nodeState.chipId]?.graphOnChip;

                return graphOnChip?.getNode(nodeState.id);
            })
            .filter((node) => node) as ComputeNode[];

        return selectedNodesList;
    }, [graphList, orderedNodeSelection]);

    return (
        <div className={`properties-container ${selectedNodes.length > 0 ? '' : 'empty'}`}>
            <div className='properties-list'>
                <div className='properties-panel-nodes'>
                    {selectedNodes.map((node) => (
                        <ComputeNodePropertiesCard
                            key={node?.uid}
                            node={node}
                            temporalEpoch={epoch}
                            graphName={graphName}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ComputeNodesPropertiesTab;
