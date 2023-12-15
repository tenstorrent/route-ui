import React, { useContext, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Card, PopoverPosition } from '@blueprintjs/core';
import { Tooltip2 } from '@blueprintjs/popover2';
import { IconNames } from '@blueprintjs/icons';
import { RootState } from 'data/store/createStore';
import { openDetailedView } from 'data/store/slices/detailedView.slice';
import { selectGroup, selectQueue, updateNodeSelection } from 'data/store/slices/nodeSelection.slice';
import { updatePipeSelection } from 'data/store/slices/pipeSelection.slice';
import DataSource from '../../../data/DataSource';
import { ComputeNode, NOCLink, PipeSegment } from '../../../data/Chip';
import { NodeSelectionState } from '../../../data/StateTypes';
import { ComputeNodeType, NOCLinkName } from '../../../data/Types';
import SelectableOperation from '../SelectableOperation';
import SelectablePipe from '../SelectablePipe';
import LinkDetails from '../LinkDetails';
import GraphVertexDetails from '../GraphVertexDetails';
import GraphVertexDetailsSelectables from '../GraphVertexDetailsSelectables';
import Collapsible from '../Collapsible';

interface ComputeNodeProps {
    node: ComputeNode;
    nodesSelectionState: NodeSelectionState;
}

const CoreOperationRuntimeMetrics = (props: { coreNode: ComputeNode }) => {
    const { coreNode } = props;

    if (coreNode.type !== ComputeNodeType.CORE || !coreNode.perfAnalyzerResults) {
        return null;
    }
    const runtimeMetrics: [string, string | number, string?][] = [
        // TODO: This is only a small subset of all details
        //  - will likely want to add more organization if more details are added here
        //  - it's probably only useful to put heatmap-related values here (once heatmap is implemented),
        //    and leave other details for a drilling-down workflow
        //  - Operand-specific metrics should probably go under each operand?
        ['Kernel Total Runtime', coreNode.perfAnalyzerResults.kernel_total_runtime, 'ns'],
        ['Bandwidth Limited Factor', coreNode.perfAnalyzerResults.bw_limited_factor],
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

const ComputeNodePropertiesCard = ({ node, nodesSelectionState }: ComputeNodeProps): React.ReactElement => {
    const dispatch = useDispatch();
    const detailedViewState = useSelector((state: RootState) => state.detailedView);

    const updatePipesState = (pipeList: string[], state: boolean) => {
        pipeList.forEach((pipeId) => {
            dispatch(updatePipeSelection({ id: pipeId, selected: state }));
        });
    };

    const setOperationSelectionState = (opName: string, selected: boolean) =>
        dispatch(
            selectGroup({
                opName,
                selected,
            }),
        );
    const setQueueSelectionState = (queueName: string, selected: boolean) =>
        dispatch(
            selectQueue({
                queueName,
                selected,
            }),
        );

    const inputs = node.operation && [...node.operation.inputs];
    const outputs = node.operation && [...node.operation.outputs];
    return (
        <Card className='node-element'>
            <h3
                className={`node-type node-type-${node.getNodeLabel()} ${
                    node.uid === detailedViewState.uid && detailedViewState.isOpen ? 'detailed-view' : ''
                }`}
            >
                {node.type.toUpperCase()}  {node.uid}
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
            {node.opCycles ? <p>Perf model estimate {node.opCycles.toLocaleString()} cycles</p> : null}
            {node.type === ComputeNodeType.DRAM && (
                <p>
                    Channel {node.dramChannelId}, Sub {node.dramSubchannelId}
                </p>
            )}
            {node.operation && (
                <div className='opname theme-dark'>
                    <Tooltip2 content={node.operation.name} position={PopoverPosition.LEFT}>
                        <SelectableOperation
                            opName={node.operation.name}
                            value={nodesSelectionState.groups[node.operation.name]?.selected}
                            selectFunc={setOperationSelectionState}
                            stringFilter=''
                        />
                    </Tooltip2>
                    {node.type === ComputeNodeType.CORE && <CoreOperationRuntimeMetrics coreNode={node} />}
                    {/* <Collapsible label={<h5>Op pipes:</h5>} isOpen styles={{ marginLeft: '20px' }}> */}
                    {/*     <ul className="scrollable-content"> */}
                    {/*         {node.operation.uniquePipeIds.map((pipeId) => ( */}
                    {/*             <li> */}
                    {/*                 <SelectablePipe */}
                    {/*                     pipeSegment={new PipeSegment(pipeId, 0, NOCLinkName.NONE)} */}
                    {/*                     pipeFilter='' */}
                    {/*                 /> */}
                    {/*             </li> */}
                    {/*         ))} */}
                    {/*     </ul> */}
                    {/* </Collapsible> */}
                </div>
            )}

            {node.queueList.length > 0 && (
                <div className='opname theme-dark'>
                    <Collapsible label={<h4>Queues:</h4>} isOpen>
                        {node.queueList.map((queue) => (
                            <>
                                <SelectableOperation
                                    disabled={nodesSelectionState.queues[queue.name]?.selected === undefined}
                                    opName={queue.name}
                                    value={nodesSelectionState.queues[queue.name]?.selected}
                                    selectFunc={setQueueSelectionState}
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
                    {inputs && inputs.length && <h4 className='io-label'>Inputs:</h4>}
                    {inputs &&
                        inputs.map((operand) => (
                            <ul className='scrollable-content'>
                                <Tooltip2 content={operand.name} position={PopoverPosition.TOP}>
                                    <div key={operand.name} style={{ fontSize: '12px' }}>
                                        <GraphVertexDetailsSelectables operand={operand} />
                                        <ul className='scrollable-content'>
                                            {operand.getPipeIdsForCore(node.uid).map((pipeId) => (
                                                <li>
                                                    <SelectablePipe
                                                        pipeSegment={new PipeSegment(pipeId, 0, NOCLinkName.NONE)}
                                                        pipeFilter=''
                                                        showBandwidth={false}
                                                    />
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </Tooltip2>
                            </ul>
                        ))}
                    {outputs && outputs.length && <h4 className='io-label'>Outputs:</h4>}
                    {outputs &&
                        outputs.map((operand) => (
                            <ul className='scrollable-content'>
                                <Tooltip2 content={operand.name} position={PopoverPosition.TOP}>
                                    <div key={operand.name} style={{ fontSize: '12px' }}>
                                        <GraphVertexDetailsSelectables operand={operand} />
                                        <ul className='scrollable-content'>
                                            {operand.getPipeIdsForCore(node.uid).map((pipeId) => (
                                                <li>
                                                    <SelectablePipe
                                                        pipeSegment={new PipeSegment(pipeId, 0, NOCLinkName.NONE)}
                                                        pipeFilter=''
                                                        showBandwidth={false}
                                                    />
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </Tooltip2>
                            </ul>
                        ))}
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
                        <LinkDetails key={link.name} link={link} showEmpty />
                    ))}
                </div>
            )}
        </Card>
    );
};

const ComputeNodesPropertiesTab = (): React.ReactElement => {
    const { chip } = useContext(DataSource);

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
                    <ComputeNodePropertiesCard key={node.uid} node={node} nodesSelectionState={nodesSelectionState} />
                ))}
            </div>
        </>
    );
};

export default ComputeNodesPropertiesTab;
