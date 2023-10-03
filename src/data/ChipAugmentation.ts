import { ComputeNodeType, Loc } from './Types';
import type { OperandName, Operation, OperationName, OpGraphNode, OpGraphNodeId, Queue } from './GraphTypes';
import { OpGraphNodeType } from './GraphTypes';
import type { ComputeNode } from './Chip';

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

export class QueueBuilder extends AbstractOpGraphNode implements Queue {
    readonly nodeType = OpGraphNodeType.QUEUE;
}

/**
 * Builds the operation data structure.
 */
export class OperationBuilder extends AbstractOpGraphNode implements Operation {
    readonly nodeType = OpGraphNodeType.OPERATION;

    protected _cores: ComputeNode[];

    constructor(name: OperationName, cores: ComputeNode[], inputOperands?: Operand[], outputOperands?: Operand[]) {
        super(name, inputOperands, outputOperands);
        this._cores = cores;
    }

    assignCore(core: ComputeNode) {
        if (core.type !== ComputeNodeType.CORE) {
            throw new Error(`Can't assign the non-core ${core.uid} to an operation (${this.name})`);
        }
        this._cores.push(core);
    }

    get cores() {
        return this._cores.values();
    }
}

/**
 * Represents the data structure for a core specific operation, which extends the operation data.
 * matches core centric data structure
 *
 * @Deprecated
 * The base Operation object now supports references to cores.
 * Cores will also provide an interface to get their operation.
 */
export class CoreOperation extends OperationBuilder {
    public coreID: string = ''; // location

    /** Represents the x,y coordinates of the core. */
    loc: Loc = { x: 0, y: 0 };

    /** label only */
    logicalCoreId: string = '';

    /** label only */
    opType: string = '';
}

/**
 * Represents the data structure for an operand.
 */
export class Operand {
    /** Name of the operand. */
    readonly name: OperandName;

    /** Type of the operand (e.g., QUEUE or OP). */
    readonly type: OpGraphNodeType;

    public pipeIdsByCore: Map<string, string[]> = new Map<string, string[]>();

    /** Bandwidth associated with the operand. */
    public bandwidth: number = 0;

    readonly from?: OpGraphNode;

    readonly to?: OpGraphNode;

    readonly perCoreMapping?: [from: ComputeNode, to: ComputeNode][];

    constructor(
        name: string,
        type: OpGraphNodeType,
        from?: OpGraphNode,
        to?: OpGraphNode,
        coreMappings?: [ComputeNode, ComputeNode][],
    ) {
        this.name = name;
        this.type = type;

        if (!!from !== !!to) {
            throw new Error('A connected operand must have both "from" and "to" values');
        }
        this.from = from;
        this.to = to;

        this.perCoreMapping = coreMappings;
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
