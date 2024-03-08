import React, { useContext, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Card, Icon } from '@blueprintjs/core';
import { Tooltip2 } from '@blueprintjs/popover2';
import { IconNames } from '@blueprintjs/icons';
import { RootState } from 'data/store/createStore';
import { openDetailedView } from 'data/store/slices/detailedView.slice';
import { updateNodeSelection } from 'data/store/slices/nodeSelection.slice';
import { updatePipeSelection } from 'data/store/slices/pipeSelection.slice';
import { JSX } from 'react/jsx-runtime';
import { ComputeNode, NOCLink, PipeSegment } from '../../../data/Chip';
import { ComputeNodeType, NOCLinkName } from '../../../data/Types';
import SelectableOperation from '../SelectableOperation';
import SelectablePipe from '../SelectablePipe';
import LinkDetails from '../LinkDetails';
import GraphVertexDetails from '../GraphVertexDetails';
import GraphVertexDetailsSelectables from '../GraphVertexDetailsSelectables';
import Collapsible from '../Collapsible';
import { calculateSlowestOperand, formatNodeUID } from '../../../utils/DataUtils';
import { OperandDirection } from '../../../data/OpPerfDetails';
import useSelectableGraphVertex from '../../hooks/useSelectableGraphVertex.hook';
import { GraphVertexType } from '../../../data/GraphNames';
import { ChipContext } from '../../../data/ChipDataProvider';

interface ComputeNodeProps {
    node: ComputeNode;
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
                <div className='core-runtime-item'>
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

const ComputeNodePropertiesCard = ({ node }: ComputeNodeProps): React.ReactElement => {
    const dispatch = useDispatch();
    const detailedViewState = useSelector((state: RootState) => state.detailedView);
    const {graphName} = useContext(ChipContext).chipState;
    const { selected, selectQueue, selectOperation, disabledQueue } = useSelectableGraphVertex();

    const updatePipesState = (pipeList: string[], state: boolean) => {
        pipeList.forEach((pipeId) => {
            dispatch(updatePipeSelection({ id: pipeId, selected: state }));
        });
    };

    const inputs = node.operation && [...node.operation.inputs];
    const outputs = node.operation && [...node.operation.outputs];
    return (
        <Card className='node-element'>
            <h3
                className={`node-type node-type-${node.getNodeLabel()} ${
                    node.uid === detailedViewState.uid && detailedViewState.isOpen ? 'detailed-view' : ''
                }`}
            >
                {node.type.toUpperCase()} {formatNodeUID(node.uid)}
                <Tooltip2 content='Close ComputeNode'>
                    <Button
                        small
                        icon={IconNames.CROSS}
                        onClick={() => {
                            dispatch(updateNodeSelection({ id: node.uid, selected: false }));
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
                            selectFunc={selectOperation}
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
                            <>
                                <SelectableOperation
                                    disabled={disabledQueue(queue.name)}
                                    opName={queue.name}
                                    value={selected(queue.name)}
                                    selectFunc={selectQueue}
                                    stringFilter=''
                                />
                                <GraphVertexDetails graphNode={queue} showQueueDetails={false} />
                            </>
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
                                <ul className='scrollable-content'>
                                    <div title={operand.name}>
                                        <div key={operand.name} style={{ fontSize: '12px' }}>
                                            <GraphVertexDetailsSelectables operand={operand} />
                                            {operand.vertexType === GraphVertexType.OPERATION && (
                                                <ul className='scrollable-content'>
                                                    {operand
                                                        .getPipesForOperatorIndexed(node.operation!.name, index)
                                                        .filter((pipeId) =>
                                                            node.getInternalPipeIDsForNode().includes(pipeId),
                                                        )
                                                        .map((pipeId) => (
                                                            <li>
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
                                                        <li>
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
                                <ul className='scrollable-content'>
                                    <div title={operand.name}>
                                        <div key={operand.name} style={{ fontSize: '12px' }}>
                                            <GraphVertexDetailsSelectables operand={operand} />
                                            {operand.vertexType === GraphVertexType.OPERATION && (
                                                <ul className='scrollable-content'>
                                                    {operand
                                                        .getPipesForOperatorIndexed(node.operation!.name, index)
                                                        .filter((pipeId) =>
                                                            node.getInternalPipeIDsForNode().includes(pipeId),
                                                        )
                                                        .map((pipeId) => (
                                                            <li>
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
                                                        <li>
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
                        disabled={node.uid === detailedViewState.uid && detailedViewState.isOpen}
                        onClick={() => dispatch(openDetailedView(node.uid))}
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

const ComputeNodesPropertiesTab = (): React.ReactElement => {
    const chip = useContext(ChipContext).getActiveChip();
    const nodesSelectionState = useSelector((state: RootState) => state.nodeSelection);
    const selectedNodes: ComputeNode[] = useMemo(() => {
        if (!chip) {
            return [];
        }
        return Object.values(nodesSelectionState.nodeList)
            .filter((n) => n.selected)
            .map((nodeState) => chip.getNode(nodeState.id));
    }, [chip, nodesSelectionState]);

    return (
        <>
            {/* {selectedNodes.length ? <div>Selected compute nodes</div> : ''} */}
            <div className='properties-panel-nodes'>
                {selectedNodes.map((node: ComputeNode) => (
                    <ComputeNodePropertiesCard key={node?.uid} node={node} />
                ))}
            </div>
        </>
    );
};

export default ComputeNodesPropertiesTab;
