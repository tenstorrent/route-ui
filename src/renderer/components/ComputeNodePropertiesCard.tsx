import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Tooltip2 } from '@blueprintjs/popover2';
import { Button, Card, Checkbox, PopoverPosition } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';

import { openDetailedView, RootState, selectGroup, updateNodeSelection, updatePipeSelection } from '../../data/store';
import { ComputeNodeType } from '../../data/Types';
import { NodeSelectionState } from '../../data/StateTypes';
import { ComputeNode, NOCLink, Pipe } from '../../data/Chip';
import SelectableOperation from './SelectableOperation';
import { OpGraphNodeType } from '../../data/GraphTypes';
import SelectablePipe from './SelectablePipe';
import LinkDetails from './LinkDetails';

interface ComputeNodeProps {
    node: ComputeNode;
    nodesSelectionState: NodeSelectionState;
}

export default function ComputeNodePropertiesCard({
    node,
    nodesSelectionState,
}: ComputeNodeProps): React.ReactElement {
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

    console.log(`RENDERED NODE ${node.uid} WITH OPERATION`, node.operation);

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
                                        {io.type === OpGraphNodeType.OPERATION ? (
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
                                                    <SelectablePipe pipe={new Pipe(pipeId, 0)} pipeFilter='' />
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
                                        {io.type === OpGraphNodeType.OPERATION ? (
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
                                                    <SelectablePipe pipe={new Pipe(pipeId, 0)} pipeFilter='' />
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
                {node.type === ComputeNodeType.DRAM && (
                    <Button
                        small
                        icon={IconNames.PROPERTIES}
                        disabled={node.uid === detailedViewState.uid && detailedViewState.isOpen}
                        onClick={() => dispatch(openDetailedView(node.uid))}
                    >
                        Detailed View
                    </Button>
                )}

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
            </div>

            <div className='node-links-wrap'>
                <h4>Links</h4>
                {node.getLinksForNode().map((link: NOCLink) => (
                    <LinkDetails key={link.name} link={link} showEmpty />
                ))}
            </div>
        </Card>
    );
}
