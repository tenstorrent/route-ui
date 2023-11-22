import React from 'react';
import { GraphVertex, GraphVertexType } from '../../data/GraphTypes';
import GraphVertexDetailsSelectables from './GraphVertexDetailsSelectables';


const GraphVertexDetails = (props: { graphNode: GraphVertex }): React.ReactElement | null => {
    const { graphNode } = props;
    const inputs = [...graphNode.inputs];
    const outputs = [...graphNode.outputs];
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
                    {/* <div className='queue-detail-item'> */}
                    {/*     <ul> */}
                    {/*         {graphNode.details['allocation-info'].map((allocationInfo) => ( */}
                    {/*             <li style={{ display: 'list-item' }}> */}
                    {/*                 {allocationInfo.channel} | {allocationInfo.address} */}
                    {/*             </li> */}
                    {/*         ))} */}
                    {/*     </ul> */}
                    {/* </div> */}
                </div>
            )}
            {inputs.length > 0 && <h5 className='io-label'>Inputs:</h5>}
            {inputs.map((operand) => (
                <div className='operation-operand' key={operand.name}>
                    <GraphVertexDetailsSelectables operand={operand} />
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
                    <GraphVertexDetailsSelectables operand={operand} />
                </div>
            ))}
        </div>
    );
};

export default GraphVertexDetails;

