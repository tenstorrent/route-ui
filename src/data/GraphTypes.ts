import type { ComputeNode } from './Chip';
import type { Operand } from './ChipAugmentation';

export type OperationName = string;
export type QueueName = string;
export type OpGraphNodeId = OperationName | QueueName;

export type OperandName = string;

export enum OpGraphNodeType {
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
    readonly nodeType: OpGraphNodeType.QUEUE;
}

export interface Operation extends HasOperands {
    readonly name: OperationName;
    readonly nodeType: OpGraphNodeType.OPERATION;
    readonly cores: Iterable<ComputeNode>;
}

/** Type alias enumerates the possible OpGraphNode types (cannot be done with subclasses alone) */
export type OpGraphNode = Operation | Queue;
