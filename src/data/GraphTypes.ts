import type { ComputeNode } from './GraphOnChip';
import type { Operand } from './Graph';
import type { QueueDetailsJson } from './sources/QueueDescriptor';
import { OperandPerformance, OpPerfDetails } from './OpPerfDetails';
import { GraphVertexType, OperationName, QueueName } from './GraphNames';

interface HasOperands {
    readonly inputs: Iterable<Operand>;
    readonly outputs: Iterable<Operand>;
}

export interface Queue extends HasOperands, Operand {
    readonly name: QueueName;
    readonly vertexType: GraphVertexType.QUEUE;
    readonly details?: QueueDetailsJson;
}

export interface Operation extends HasOperands, Operand {
    readonly name: OperationName;
    readonly vertexType: GraphVertexType.OPERATION;
    readonly cores: Iterable<ComputeNode>;
    details?: OpPerfDetails
    slowestOperand: Operand | null;
    isOffchip: boolean;
    getOperandByPerformance(op:OperandPerformance | null): Operand | null;
}

/** Type alias enumerates the possible GraphVertex types (cannot be done with subclasses alone) */
export type GraphVertex = Operation | Queue;
