import type { OperationName, QueueName, OpGraphNodeType, OpGraphNodeId } from '../GraphTypes';
import { BuildableOperand, BuildableOperation, BuildableQueue } from '../ChipAugmentation';
import type Chip from "../Chip";
import type { ComputeNode } from "../Chip";

export type CoreID = string;

interface OperationOperandJSON {
    index: number;
    name: OperationName;
    type: OpGraphNodeType.OPERATION;
}

interface QueueOperandJSON {
    index: number;
    name: QueueName;
    type: OpGraphNodeType.QUEUE;
}

export type OperandJSON = OperationOperandJSON | QueueOperandJSON;

export interface CoreOperationMappingJSON {
    'logical-core-id': string;
    'op-name': OperationName;
    'op-type': string;
    inputs: OperandJSON[];
    outputs: OperandJSON[];
}

export interface GraphDescriptorJSON {
    [coreId: CoreID]: CoreOperationMappingJSON;
}

export interface OperationDetails {
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

export const aggregateCoresByOperation = (json: GraphDescriptorJSON): Map<string, OperationDetails> => {
    return Object.entries<CoreOperationMappingJSON>(json).reduce(
        (opsMap: Map<OperationName, OperationDetails>, [coreId, opMapping]) => {
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
            op.cores.push({ id: coreId, logicalId: opMapping["logical-core-id"] });
            return opsMap;
        },
        new Map(),
    );
};

export const loadGraphDescriptor = (graphName: string, graphDescriptorJSON: GraphDescriptorJSON, chip: Chip) => {

};
