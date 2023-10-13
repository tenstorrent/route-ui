import type { OperationName, QueueName, OpGraphNodeType, OpGraphNodeId } from '../GraphTypes';
import { Operand, Operation, OpGraph, OpGraphBuilder, OpGraphNode } from '../ChipAugmentation';
import type Chip from "../Chip";

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

interface NewCoreOperationMappingJSON {
    'logical-core-id': string;
    'op-name': OperationName;
    'op-type': string;
    inputs: OperandJSON[];
    outputs: OperandJSON[];
}

export interface GraphDescriptorJSON {
    [coreId: string]: NewCoreOperationMappingJSON;
}

interface OperationDetails {
    name: OperationName;
    type: string;
    cores: string[];
    inputsByCore: Map<string, OperandJSON[]>;
    outputsByCore: Map<string, OperandJSON[]>;
}

const aggregateCoresByOperation = (json: GraphDescriptorJSON): Map<string, OperationDetails> => {
    return Object.entries<NewCoreOperationMappingJSON>(json).reduce(
        (opsMap: Map<string, OperationDetails>, [coreId, opMapping]) => {
            const opName: OperationName = opMapping['op-name'];
            if (!opsMap.has(opName)) {
                opsMap.set(opName, {
                    name: opName,
                    type: opMapping['op-type'],
                    cores: [],
                    inputsByCore: new Map(),
                    outputsByCore: new Map(),
                });
            }
            const op = opsMap.get(opName)!;
            op.cores.push(coreId);
            op.inputsByCore.set(coreId, opMapping.inputs);
            op.outputsByCore.set(coreId, opMapping.outputs);
            return opsMap;
        },
        new Map(),
    );
};

export const parseOperations = (graphName: string, json: GraphDescriptorJSON, chip: Chip) => {
    const ops: Map<OperationName, OperationDetails> = aggregateCoresByOperation(json);
    const graphNodes: Map<OpGraphNodeId, OpGraphNode> = new Map();

    // eslint-disable-next-line no-restricted-syntax
    [...ops.entries()].forEach(([opName, opDetails]) => {
        const newOp: Operation = new Operation(opDetails.name, [], [], []);
        graphNodes.set(newOp.name, newOp);
        const inputOperands: Operand[] = [...opDetails.inputsByCore.values()].flat().map((operand)=> {
            if (!graphNodes.has(operand.name)) {

            }
            new Operand(operand.name, operand.type, newOp, otherOp)
        });
    });

};
