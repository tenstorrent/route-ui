import React from 'react';
import { GraphVertex, GraphVertexType } from '../../data/GraphTypes';
import SelectableOperation from './SelectableOperation';
import { Checkbox } from '@blueprintjs/core';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, selectGroup } from '../../data/store';

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
    return (
        <div className='operation-details' style={{ color: '#000', marginLeft: '20px' }}>
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
                            <span>{operand.name}</span>
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
