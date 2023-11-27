import type { ComputeNode } from './Chip';
import type { Operand } from './Graph';
import type { QueueDetailsJson } from './sources/QueueDescriptor';
import { OpAttributesJSON, OpMeasurementsJSON } from './sources/PerfAnalyzerResults';

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

// TODO: there is a possible inconsistency with detailes vs attributs and measurements

export interface Queue extends HasOperands {
    readonly name: QueueName;
    readonly vertexType: GraphVertexType.QUEUE;
    readonly details?: QueueDetailsJson;
}

export interface Operation extends HasOperands {
    readonly name: OperationName;
    readonly vertexType: GraphVertexType.OPERATION;
    readonly cores: Iterable<ComputeNode>;
    attributes: OpAttributesJSON | null;
    measurements: OpMeasurementsJSON | null;
}

/** Type alias enumerates the possible GraphVertex types (cannot be done with subclasses alone) */
export type GraphVertex = Operation | Queue;
