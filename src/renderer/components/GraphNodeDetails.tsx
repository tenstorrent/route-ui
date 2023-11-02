import React from 'react';
import { OpGraphNode } from '../../data/GraphTypes';

const GraphNodeDetails = (props: { graphNode: OpGraphNode }): React.ReactElement => {
    const { graphNode } = props;
    const inputs = [...graphNode.inputs];
    const outputs = [...graphNode.outputs];

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
                </div>
            ))}
        </div>
    );
};

export default GraphNodeDetails;
