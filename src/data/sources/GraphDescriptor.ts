// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent Inc.

import { GraphVertexType, OperationName, QueueName } from '../GraphNames';

export type CoreID = string;

interface OperationOperandJSON {
    index: number;
    name: OperationName;
    type: GraphVertexType.OPERATION;
}

interface QueueOperandJSON {
    index: number;
    name: QueueName;
    type: GraphVertexType.QUEUE;
}

export type OperandJSON = OperationOperandJSON | QueueOperandJSON;

export interface CoreOperationMappingJSON {
    'logical-core-id': string;
    'op-name': OperationName;
    'op-type': string;
    inputs: OperandJSON[];
    outputs: OperandJSON[];
}

/** Represents all the core-to-operation and operation-to-operand mappings for a single graph.
 *
 * Note that while every core-to-operation mapping provides a set of input and output operands, these operands
 * will always be identical for the same operation name.
 */
export interface GraphDescriptorJSON {
    [coreId: CoreID]: CoreOperationMappingJSON;
}

/** Intermediate data structure that describes an operation, to help with loading. */
export interface OperationDescription {
    name: OperationName;
    type: string;
    cores: CoreDetails[];
    inputs: OperandJSON[];
    outputs: OperandJSON[];
}

export interface CoreDetails {
    id: CoreID;
    logicalId: string;
}

/** Builds an inversion of the Graph Descriptor JSON data structure to collect groups of cores by the operation mapped to them. */
export const aggregateCoresByOperation = (json: GraphDescriptorJSON): Map<string, OperationDescription> => {
    return Object.entries<CoreOperationMappingJSON>(json).reduce(
        (opsMap: Map<OperationName, OperationDescription>, [coreId, opMapping]) => {
            const opName: OperationName = opMapping['op-name'];
            if (!opsMap.has(opName)) {
                opsMap.set(opName, {
                    name: opName,
                    type: opMapping['op-type'],
                    cores: [],
                    inputs: opMapping.inputs,
                    outputs: opMapping.outputs,
                });
            }
            const op = opsMap.get(opName)!;
            op.cores.push({ id: coreId, logicalId: opMapping['logical-core-id'] });
            return opsMap;
        },
        new Map(),
    );
};
