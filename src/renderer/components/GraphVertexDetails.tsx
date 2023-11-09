import React from 'react';
import { GraphVertex } from '../../data/GraphTypes';

const GraphVertexDetails = (props: { graphNode: GraphVertex }): React.ReactElement | null => {
    const { graphNode } = props;
    const inputs = [...graphNode.inputs];
    const outputs = [...graphNode.outputs];

    if (inputs.length === 0 && outputs.length === 0) {
        return null;
    }
    return (
        <div className='operation-details' style={{ color: '#000', marginLeft: '20px' }}>
            {inputs.length > 0 && <h5 className='io-label'>Inputs:</h5>}
            {inputs.map((io) => (
                <div className='operation-input' key={io.name}>
                    <p>{io.name}</p>
                </div>
            ))}
            {outputs.length > 0 && <h5 className='io-label'>Outputs:</h5>}
            {outputs.map((io) => (
                <div className='operation-input' key={io.name}>
                    <p>{io.name}</p>
                    {/* DEBUGING RENDER */}
                    {/* <ul> */}
                    {/*     {[...io.pipeIdsByCore.entries()].map(([coreId,pipeIds ]) => ( */}
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
                </div>
            ))}
        </div>
    );
};

export default GraphVertexDetails;
