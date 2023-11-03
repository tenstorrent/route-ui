import type { ComputeNode } from './Chip';
import type { Operand } from './ChipAugmentation';

export type OperationName = string;
export type QueueName = string;
export type GraphVertexId = OperationName | QueueName;

export type OperandName = string;

export enum GraphVertexType {
    QUEUE = 'queue',
    OPERATION = 'op',
}

export type GraphName = string;

interface HasOperands {
    readonly inputs: Iterable<Operand>;
    readonly outputs: Iterable<Operand>;
}

export interface Queue extends HasOperands {
    readonly name: QueueName;
    readonly vertexType: GraphVertexType.QUEUE;
}

export interface Operation extends HasOperands {
    readonly name: OperationName;
    readonly vertexType: GraphVertexType.OPERATION;
    readonly cores: Iterable<ComputeNode>;
}

/** Type alias enumerates the possible GraphVertex types (cannot be done with subclasses alone) */
export type GraphVertex = Operation | Queue;
