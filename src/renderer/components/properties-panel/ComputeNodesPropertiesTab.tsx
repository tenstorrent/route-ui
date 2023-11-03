import React, { useContext, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Card, Checkbox, PopoverPosition } from '@blueprintjs/core';
import { Tooltip2 } from '@blueprintjs/popover2';
import { IconNames } from '@blueprintjs/icons';
import DataSource from '../../../data/DataSource';
import {
    openDetailedView,
    RootState,
    selectGroup,
    updateNodeSelection,
    updatePipeSelection,
} from '../../../data/store';
import { ComputeNode, NOCLink, PipeSegment } from '../../../data/Chip';
import { NodeSelectionState } from '../../../data/StateTypes';
import { ComputeNodeType, NOCLinkName } from '../../../data/Types';
import SelectableOperation from '../SelectableOperation';
import { GraphVertexType } from '../../../data/GraphTypes';
import SelectablePipe from '../SelectablePipe';
import LinkDetails from '../LinkDetails';

interface ComputeNodeProps {
    node: ComputeNode;
    nodesSelectionState: NodeSelectionState;
}

const ComputeNodePropertiesCard = ({ node, nodesSelectionState }: ComputeNodeProps): React.ReactElement => {
    const dispatch = useDispatch();
    const detailedViewState = useSelector((state: RootState) => state.detailedView);

    const updatePipesState = (pipeList: string[], state: boolean) => {
        pipeList.forEach((pipeId) => {
            dispatch(updatePipeSelection({ id: pipeId, selected: state }));
        });
    };
    const setSelectionState = (selected: boolean) => {
        dispatch(updateNodeSelection({ id: node.uid, selected }));
    };

    const setOperationSelectionState = (opName: string, selected: boolean) =>
        dispatch(
            selectGroup({
                opName,
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
                {node.type.toUpperCase()} - {node.loc.x}, {node.loc.y}
                <Tooltip2 content='Close ComputeNode'>
                    <Button
                        small
                        icon={IconNames.CROSS}
                        onClick={() => {
                            setSelectionState(false);
                        }}
                    />
                </Tooltip2>
            </h3>
            {node.opCycles ? <p>{node.opCycles.toLocaleString()} cycles</p> : null}
            {node.type === ComputeNodeType.DRAM ? (
                <p>
                    Channel {node.dramChannelId}, Sub {node.dramSubchannelId}
                </p>
            ) : null}
            {node.operation && (
                <div className='opname'>
                    <Tooltip2 content={node.operation.name} position={PopoverPosition.LEFT}>
                        <SelectableOperation
                            opName={node.operation.name}
                            value={nodesSelectionState.groups[node.operation.name]?.selected}
                            selectFunc={setOperationSelectionState}
                            stringFilter=''
                        />
                    </Tooltip2>
                </div>
            )}
            {node.operation && (
                <div className='opname'>
                    {inputs && inputs.length && <h4 className='io-label'>Inputs:</h4>}
                    {inputs &&
                        inputs.map((io) => (
                            <ul className='scrollable-content'>
                                <Tooltip2 content={io.name} position={PopoverPosition.TOP}>
                                    <div key={io.name} style={{ fontSize: '12px' }}>
                                        {io.type === GraphVertexType.OPERATION ? (
                                            <SelectableOperation
                                                opName={io.name}
                                                value={nodesSelectionState.groups[io.name]?.selected}
                                                selectFunc={setOperationSelectionState}
                                                stringFilter=''
                                            />
                                        ) : (
                                            <div className='op-element'>
                                                <Checkbox checked={false} disabled />
                                                <span>{io.name}</span>
                                            </div>
                                        )}
                                        <ul className='scrollable-content'>
                                            {io.getPipeIdsForCore(node.uid).map((pipeId) => (
                                                <li>
                                                    <SelectablePipe
                                                        pipeSegment={new PipeSegment(pipeId, 0, NOCLinkName.NONE)}
                                                        pipeFilter=''
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
                        outputs.map((io) => (
                            <ul className='scrollable-content'>
                                <Tooltip2 content={io.name} position={PopoverPosition.TOP}>
                                    <div key={io.name} style={{ fontSize: '12px' }}>
                                        {io.type === GraphVertexType.OPERATION ? (
                                            <SelectableOperation
                                                opName={io.name}
                                                value={nodesSelectionState.groups[io.name]?.selected}
                                                selectFunc={setOperationSelectionState}
                                                stringFilter=''
                                            />
                                        ) : (
                                            <div className='op-element'>
                                                <Checkbox checked={false} disabled />
                                                <span>{io.name}</span>
                                            </div>
                                        )}
                                        <ul className='scrollable-content'>
                                            {io.getPipeIdsForCore(node.uid).map((pipeId) => (
                                                <li>
                                                    <SelectablePipe
                                                        pipeSegment={new PipeSegment(pipeId, 0, NOCLinkName.NONE)}
                                                        pipeFilter=''
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
                {(node.type === ComputeNodeType.DRAM || node.type === ComputeNodeType.ETHERNET) && (
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
