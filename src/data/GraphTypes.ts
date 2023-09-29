export type GraphName = string;

export type OperationName = string;
export type QueueName = string;
export type OpGraphNodeId = OperationName | QueueName

export type OperandName = string;

export interface OpGraphNode {
    name: OpGraphNodeId;
    nodeType: OpGraphNodeType;
}

export enum OpGraphNodeType {
    QUEUE = 'queue',
    OPERATION = 'op',
}
