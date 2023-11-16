import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Checkbox } from '@blueprintjs/core';
import { selectGroup } from 'data/store/slices/nodeSelection.slice';
import { RootState } from 'data/store/createStore';
import { GraphVertex, GraphVertexType } from '../../data/GraphTypes';
import SelectableOperation from './SelectableOperation';

const GraphVertexDetails = (props: { graphNode: GraphVertex }): React.ReactElement | null => {
    const { graphNode } = props;
    const inputs = [...graphNode.inputs];
    const outputs = [...graphNode.outputs];
    const nodesSelectionState = useSelector((state: RootState) => state.nodeSelection);
    const dispatch = useDispatch();
    const setOperationSelectionState = (opName: string, selected: boolean) =>
        dispatch(
            selectGroup({
                opName,
                selected,
            }),
        );

    if (inputs.length === 0 && outputs.length === 0) {
        return null;
    }

    const parseQueueLocation = (locationString: string) => {
        const match = locationString.match(/LOCATION::(\w+)/);
        if (match !== null) {
            return match[1];
        }
        return null;
    };

    return (
        <div className='graph-vertex-details'>
            {graphNode.vertexType === GraphVertexType.QUEUE && graphNode.details && (
                <div className='queue-details'>
                    <div className='queue-detail-item'>
                        {/* TODO: Find out the string format and possible vales for Queue Location (and other details) and convert to an enum,
                              so we're not parsing raw data
                          */}
                        <h5 className='queue-detail-label'>Queue Location:</h5>
                        <div className='queue-detail-value'>
                            {parseQueueLocation(graphNode.details.location)} (Device {graphNode.details['device-id']})
                        </div>
                    </div>
                </div>
            )}
            {inputs.length > 0 && <h5 className='io-label'>Inputs:</h5>}
            {inputs.map((operand) => (
                <div className='operation-operand' key={operand.name}>
                    {operand.type === GraphVertexType.OPERATION ? (
                        <SelectableOperation
                            opName={operand.name}
                            value={nodesSelectionState.groups[operand.name]?.selected}
                            selectFunc={setOperationSelectionState}
                            stringFilter=''
                        />
                    ) : (
                        <div className='op-element'>
                            <Checkbox checked={false} disabled />
                            <span>- {operand.name}</span>
                        </div>
                    )}
                </div>
            ))}
            {outputs.length > 0 && <h5 className='io-label'>Outputs:</h5>}
            {outputs.map((operand) => (
                <div className='operation-operand' key={operand.name}>
                    {/* DEBUGING RENDER */}
                    {/* <ul> */}
                    {/*     {[...operand.pipeIdsByCore.entries()].map(([coreId,pipeIds ]) => ( */}
                    {/*         <li key={coreId}> */}
                    {/*             <p>{coreId}</p> */}
                    {/*             <ul> */}
                    {/*                 {pipeIds.map((pipeId) => ( */}
                    {/*                     <li key={pipeId}>{pipeId}</li> */}
                    {/*                 ))} */}
                    {/*             </ul> */}
                    {/*         </li> */}
                    {/*     ))} */}
                    {/* </ul> */}
                    {operand.type === GraphVertexType.OPERATION ? (
                        <SelectableOperation
                            opName={operand.name}
                            value={nodesSelectionState.groups[operand.name]?.selected}
                            selectFunc={setOperationSelectionState}
                            stringFilter=''
                        />
                    ) : (
                        <div className='op-element'>
                            <Checkbox checked={false} disabled />
                            <span>{operand.name}</span>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default GraphVertexDetails;
