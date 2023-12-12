export type OperationName = string;
export type QueueName = string;
export type GraphVertexId = OperationName | QueueName;
export type OperandName = string;
export type GraphName = string;

export enum GraphVertexType {
    QUEUE = 'queue',
    OPERATION = 'op',
}
