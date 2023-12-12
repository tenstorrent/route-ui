import React, { FC } from 'react';
import { GraphVertex } from '../../data/GraphTypes';
import GraphVertexDetailsSelectables from './GraphVertexDetailsSelectables';
import { PipeSegment } from '../../data/Chip';
import { NOCLinkName } from '../../data/Types';
import SelectablePipe from './SelectablePipe';
import Collapsible from './Collapsible';
import { GraphVertexType } from '../../data/GraphNames';

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
            {inputs.map((operand, index) => (
                <div className='operation-operand' key={`${graphNode.name}-${operand.name}`}>
                    <GraphVertexDetailsSelectables operand={operand} />
                    <Collapsible label={<h5>pipes:</h5>} isOpen={false}>
                        <ul className='scrollable-content'>
                            {operand.uniquePipeIds.map((pipeId) => (
                                <li>
                                    <SelectablePipe
                                        pipeSegment={new PipeSegment(pipeId, 0, NOCLinkName.NONE)}
                                        pipeFilter=''
                                    />
                                </li>
                            ))}
                        </ul>
                    </Collapsible>
                </div>
            ))}

            {outputs.length > 0 && <h5 className='io-label'>Outputs:</h5>}
            {outputs.map((operand, index) => (
                <div className='operation-operand' key={`${graphNode.name}-${operand.name}`}>
                    <GraphVertexDetailsSelectables operand={operand} />
                    <Collapsible label={<h5>pipes:</h5>} isOpen={false}>
                        <ul className='scrollable-content'>
                            {operand.uniquePipeIds.map((pipeId) => (
                                <li>
                                    <SelectablePipe
                                        pipeSegment={new PipeSegment(pipeId, 0, NOCLinkName.NONE)}
                                        pipeFilter=''
                                    />
                                </li>
                            ))}
                        </ul>
                    </Collapsible>
                </div>
            ))}
        </div>
    );
};

GraphVertexDetails.defaultProps = {
    showQueueDetails: true,
};

export default GraphVertexDetails;
