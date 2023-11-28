import React, { FC } from 'react';
import { GraphVertex, GraphVertexType } from '../../data/GraphTypes';
import GraphVertexDetailsSelectables from './GraphVertexDetailsSelectables';

interface GraphVertexDetailsProps {
    graphNode: GraphVertex;
    showQueueDetails?: boolean;
}

const GraphVertexDetails: FC<GraphVertexDetailsProps> = ({
    graphNode,
    showQueueDetails = true,
}): React.ReactElement | null => {
    const inputs = [...graphNode.inputs];
    const outputs = [...graphNode.outputs];
    if (inputs.length === 0 && outputs.length === 0) {
        return null;
    }

    return (
        <div className='graph-vertex-details'>
            {graphNode.vertexType === GraphVertexType.QUEUE && graphNode.details && showQueueDetails && (
                <div className='queue-details'>
                    <div className='queue-detail-item'>
                        {/* TODO: Find out the string format and possible vales for Queue Location (and other details) and convert to an enum,
                              so we're not parsing raw data
                          */}
                        <h5 className='queue-detail-label'>Queue Location:</h5>
                        <div className='queue-detail-value'>
                            {graphNode.details.processedLocation} (Device {graphNode.details['device-id']})
                        </div>
                    </div>
                </div>
            )}
            {inputs.length > 0 && <h5 className='io-label'>Inputs:</h5>}
            {inputs.map((operand) => (
                <div className='operation-operand' key={graphNode.name + operand.name}>
                    <GraphVertexDetailsSelectables operand={operand} />
                    {/* DEBUGING RENDER */}
                    {/* <ul> */}
                    {/*     {[...operand.pipeIdsByCore.entries()].map(([coreId, pipeIds]) => ( */}
                    {/*         <li style={{ display: 'list-item' }} key={coreId}> */}
                    {/*             <p>{coreId}</p> */}
                    {/*             <div> */}
                    {/*                 {pipeIds.map((pipeId) => ( */}
                    {/*                     <span>{pipeId}, </span> */}
                    {/*                 ))} */}
                    {/*             </div> */}
                    {/*         </li> */}
                    {/*     ))} */}
                    {/* </ul> */}
                </div>
            ))}
            {outputs.length > 0 && <h5 className='io-label'>Outputs:</h5>}
            {outputs.map((operand) => (
                <div className='operation-operand' key={graphNode.name + operand.name}>
                    <GraphVertexDetailsSelectables operand={operand} />
                    {/* DEBUGING RENDER */}
                    {/* <ul> */}
                    {/*     {[...operand.pipeIdsByCore.entries()].map(([coreId, pipeIds]) => ( */}
                    {/*         <li style={{ display: 'list-item' }} key={coreId}> */}
                    {/*             <p>{coreId}</p> */}
                    {/*             <div> */}
                    {/*                 {pipeIds.map((pipeId) => ( */}
                    {/*                     <span>{pipeId}, </span> */}
                    {/*                 ))} */}
                    {/*             </div> */}
                    {/*         </li> */}
                    {/*     ))} */}
                    {/* </ul> */}
                </div>
            ))}
        </div>
    );
};

GraphVertexDetails.defaultProps = {
    showQueueDetails: true,
};

export default GraphVertexDetails;
