import { process } from '@electron/remote';
import { ComputeNodeType } from './Types';
import type { GraphVertex, GraphVertexId, OperandName, Operation, OperationName, Queue } from './GraphTypes';
import { GraphVertexType } from './GraphTypes';
import { QueueDetailsJson } from './sources/QueueDescriptor';
import { OpPerfJSON } from './sources/PerfAnalyzerResults';
import { ComputeNode } from './Chip';
import { OpPerfDetails } from './OpPerfDetails';

/** Provides common functionality for Graph Nodes.
 * Intended to be extended once for each value of `GraphVertexType`. */
export abstract class AbstractGraphVertex implements Operand {
    readonly name: GraphVertexId;

    abstract readonly vertexType: GraphVertexType;

    protected inputOperands: Operand[];

    protected outputOperands: Operand[];

    private _pipeIdsByCore: Map<string, string[]> = new Map();

    public toString(): string {
        return `${this.name} (${this.vertexType})`;
    }

    public get pipeIdsByCore(): Map<string, string[]> {
        return this._pipeIdsByCore;
    }

    public set pipeIdsByCore(value: Map<string, string[]>) {
        // console.log(`updating ${this.name} with ${value.size}`);
        if (this._pipeIdsByCore.size > 0) {
            value.forEach((pipeids, key) => {
                if (this._pipeIdsByCore.has(key)) {
                    this._pipeIdsByCore.get(key)!.push(...pipeids);
                } else {
                    this._pipeIdsByCore.set(key, pipeids);
                }
            });
        }
        this._pipeIdsByCore = value;
    }

    public bandwidth: number = 0;

    readonly from?: GraphVertex;

    readonly to?: GraphVertex;

    readonly perCoreMapping?: [from: ComputeNode, to: ComputeNode][];

    constructor(name: string, inputOperands?: Operand[], outputOperands?: Operand[]) {
        this.name = name;
        this.inputOperands = [];
        this.outputOperands = [];
        this.assignInputs(inputOperands || []);
        this.assignOutputs(outputOperands || []);
    }

    /** All input operands */
    get inputs(): Operand[] {
        // TODO: this is a slight performance hit, to remove once pipe data is merged
        if (process.env.NODE_ENV === 'development') {
            return [...this.inputOperands];
        }
        return this.inputOperands;
    }

    /** All output operands */
    get outputs(): Operand[] {
        if (process.env.NODE_ENV === 'development') {
            return [...this.outputOperands];
        }
        return this.outputOperands;
    }

    assignInputs(inputs: Operand[]) {
        this.inputOperands = [...new Set([...this.inputOperands, ...inputs])];
        if (process.env.NODE_ENV === 'development') {
            const inputNames = this.inputs.map((input) => input.name);
            if (inputNames.length !== new Set(inputNames).size) {
                throw new Error(`Operation ${this.name} has duplicate input operands`);
            }
        }
    }

    assignOutputs(outputs: Operand[]) {
        this.outputOperands = [...new Set([...this.outputOperands, ...outputs])];
        if (process.env.NODE_ENV === 'development') {
            const outputNames = this.outputs.map((output) => output.name);
            if (outputNames.length !== new Set(outputNames).size) {
                throw new Error(`Operation ${this.name} has duplicate output operands`);
            }
        }
    }

    get uniquePipeIds(): string[] {
        return [...new Set([...this.pipeIdsByCore.values()].flat())];
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

export class BuildableQueue extends AbstractGraphVertex implements Queue {
    readonly vertexType = GraphVertexType.QUEUE;

    details?: QueueDetailsJson;
}

/**
 * An implementation of the `Operation` interface which has methods to support incremental
 * additions to the data structure contents.
 */
export class BuildableOperation extends AbstractGraphVertex implements Operation {
    readonly vertexType = GraphVertexType.OPERATION;

    protected _cores: ComputeNode[];

    constructor(name: OperationName, cores: ComputeNode[], inputOperands?: Operand[], outputOperands?: Operand[]) {
        super(name, inputOperands, outputOperands);
        this._cores = [];
        cores.forEach((core) => this.assignCore(core));
    }

    details?: OpPerfDetails;

    /** Creates a mutual association between this Operation and the provided core, such that `core.operation` will
     * reference this operation.
     *
     */
    assignCore(core: ComputeNode) {
        if (core.type !== ComputeNodeType.CORE) {
            throw new Error(`Can't assign the non-core ${core.uid} to an operation (${this.name})`);
        }
        core.operation = this;
        if (this._cores.includes(core)) {
            console.warn(
                `Assigning core ${core.uid} to operation ${this.name}; core is already assigned to this operation.`,
            );
            return;
        }
        this._cores.push(core);
    }

    get cores() {
        return this._cores.values();
    }
}

export interface Operand {
    name: OperandName;
    vertexType: GraphVertexType;
    from?: GraphVertex;
    to?: GraphVertex;
    pipeIdsByCore: Map<string, string[]>;
    perCoreMapping?: [from: ComputeNode, to: ComputeNode][];
    uniquePipeIds: string[];

    getPipeIdsForCore(coreId: string): string[];

    getAllPipeIds(): Iterable<string[]>;

    isConnected(): boolean;
}
