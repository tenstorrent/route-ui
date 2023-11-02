import { ComputeNodeType, Loc } from './Types';
import type { OperandName, Operation, OperationName, OpGraphNode, OpGraphNodeId, Queue } from './GraphTypes';
import { OpGraphNodeType } from './GraphTypes';
import type { ComputeNode } from './Chip';
import type Chip from './Chip';

/** Provides common functionality for Graph Nodes.
 * Intended to be extended once for each value of OpGraphNodeType. */
export abstract class AbstractOpGraphNode {
    readonly name: OpGraphNodeId;

    abstract readonly nodeType: OpGraphNodeType;

    protected inputOperands: Operand[];

    protected outputOperands: Operand[];

    constructor(name: string, inputOperands?: Operand[], outputOperands?: Operand[]) {
        this.name = name;
        this.inputOperands = inputOperands || [];
        this.outputOperands = outputOperands || [];
    }

    /** All input operands */
    get inputs(): Operand[] {
        return this.inputOperands;
    }

    /** All output operands */
    get outputs(): Operand[] {
        return this.outputOperands;
    }
}

export class BuildableQueue extends AbstractOpGraphNode implements Queue {
    readonly nodeType = OpGraphNodeType.QUEUE;
}

/**
 * A concrete implementation of the Operation interface which has methods to support incremental
 * additions to the data structure.
 */
export class BuildableOperation extends AbstractOpGraphNode implements Operation {
    readonly nodeType = OpGraphNodeType.OPERATION;

    protected _cores: ComputeNode[];

    constructor(name: OperationName, cores: ComputeNode[], inputOperands?: Operand[], outputOperands?: Operand[]) {
        super(name, inputOperands, outputOperands);
        this._cores = [];
        cores.forEach((core) => this.assignCore(core));
    }

    assignCore(core: ComputeNode) {
        if (core.type !== ComputeNodeType.CORE) {
            throw new Error(`Can't assign the non-core ${core.uid} to an operation (${this.name})`);
        }
        if (!core.operation) {
            core.operation = this;
        } else if (core.operation !== this) {
            throw new Error("Core already has an operation assignment. Can't reassign core to this operation.");
        }
        this._cores.push(core);
    }

    assignInputs(inputs: Operand[]) {
        this.inputs.push(...inputs);
    }

    assignOutputs(outputs: Operand[]) {
        this.outputs.push(...outputs);
    }

    get cores() {
        return this._cores.values();
    }
}

/**
 * Represents the data structure for an operand.
 */
export class Operand {
    /** Name of the operand. */
    readonly name: OperandName;

    /** Type of the operand (e.g., QUEUE or OP). */
    readonly type: OpGraphNodeType;

    public pipeIdsByCore: Map<string, string[]>;

    /** Bandwidth associated with the operand. */
    public bandwidth: number = 0;

    readonly from?: OpGraphNode;

    readonly to?: OpGraphNode;

    readonly perCoreMapping?: [from: ComputeNode, to: ComputeNode][];

    constructor(
        name: string,
        type: OpGraphNodeType,
        pipesByCore?: Map<string, string[]>,
        from?: OpGraphNode,
        to?: OpGraphNode,
    ) {
        this.name = name;
        this.type = type;

        this.pipeIdsByCore = pipesByCore || new Map();

        if (!!from !== !!to) {
            throw new Error('A connected operand must have both "from" and "to" values');
        }
        this.from = from;
        this.to = to;
    }

    isConnected(): boolean {
        return !!(this.from && this.to);
    }

    public getPipeIdsForCore(coreId: string): string[] {
        return this.pipeIdsByCore.get(coreId) || [];
    }

    public getAllPipeIds() {
        return this.pipeIdsByCore.values();
    }
}

export enum OpIoType {
    INPUTS = 'inputs',
    OUTPUTS = 'outputs',
}
