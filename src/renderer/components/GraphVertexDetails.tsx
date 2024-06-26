// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent AI ULC

/* eslint-disable react/no-array-index-key */

import React, { FC } from 'react';
import { PipeSegment } from '../../data/GraphOnChip';
import { GraphVertexType } from '../../data/GraphNames';
import { GraphVertex, Queue } from '../../data/GraphTypes';
import { NOCLinkName } from '../../data/Types';
import GraphVertexDetailsSelectables from './GraphVertexDetailsSelectables';
import SelectablePipe from './SelectablePipe';

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
                        {/* TODO: Find out the string format and possible values for Queue Location (and other details) and convert to an enum,
                              so we're not parsing raw data
                          */}
                        <h5 className='queue-detail-label'>Queue Location:</h5>
                        <div className='queue-detail-value'>
                            {(graphNode as Queue).details?.processedLocation} (Device{' '}
                            {(graphNode as Queue).details!['device-id']})
                        </div>
                    </div>
                </div>
            )}
            {inputs.length > 0 && <h5 className='io-label'>Inputs:</h5>}
            {inputs.map((operand, index) => (
                <div className='operation-operand' key={`${index}-${graphNode.name}-${operand.name}`}>
                    <GraphVertexDetailsSelectables operand={operand} />
                    {graphNode.vertexType === GraphVertexType.OPERATION && (
                        <ul className='scrollable-content'>
                            {operand.getPipesForOperatorIndexed(graphNode.name, index).map((pipeId) => (
                                <li key={`${index}-${pipeId}-${graphNode.name}-${operand.name}`}>
                                    <SelectablePipe
                                        pipeSegment={new PipeSegment(pipeId, 0, NOCLinkName.NONE)}
                                        pipeFilter=''
                                        showBandwidth={false}
                                    />
                                </li>
                            ))}
                        </ul>
                    )}
                    {graphNode.vertexType === GraphVertexType.QUEUE && (
                        <ul className='scrollable-content'>
                            {graphNode.getPipesForOperator(operand.name).map((pipeId) => (
                                <li key={`${index}-${pipeId}-${graphNode.name}-${operand.name}`}>
                                    <SelectablePipe
                                        pipeSegment={new PipeSegment(pipeId, 0, NOCLinkName.NONE)}
                                        pipeFilter=''
                                        showBandwidth={false}
                                    />
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            ))}

            {outputs.length > 0 && <h5 className='io-label'>Outputs:</h5>}
            {outputs.map((operand, index) => (
                <div className='operation-operand' key={`${index}-${graphNode.name}-${operand.name}`}>
                    <GraphVertexDetailsSelectables operand={operand} />
                    {graphNode.vertexType === GraphVertexType.OPERATION && (
                        <ul className='scrollable-content'>
                            {operand.getPipesForOperatorIndexed(graphNode.name, index).map((pipeId) => (
                                <li key={`${index}-${pipeId}-${graphNode.name}-${operand.name}`}>
                                    <SelectablePipe
                                        pipeSegment={new PipeSegment(pipeId, 0, NOCLinkName.NONE)}
                                        pipeFilter=''
                                        showBandwidth={false}
                                    />
                                </li>
                            ))}
                        </ul>
                    )}
                    {graphNode.vertexType === GraphVertexType.QUEUE && (
                        <ul className='scrollable-content'>
                            {graphNode.getPipesForOperator(operand.name).map((pipeId) => (
                                <li key={`${index}-${pipeId}-${graphNode.name}-${operand.name}`}>
                                    <SelectablePipe
                                        pipeSegment={new PipeSegment(pipeId, 0, NOCLinkName.NONE)}
                                        pipeFilter=''
                                        showBandwidth={false}
                                    />
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            ))}
        </div>
    );
};

GraphVertexDetails.defaultProps = {
    showQueueDetails: true,
};

export default GraphVertexDetails;
