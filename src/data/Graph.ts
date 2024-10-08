// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent AI ULC

import { GraphVertexId, GraphVertexType, OperandName, OperationName } from './GraphNames';
// eslint-disable-next-line import/no-cycle
import { ComputeNode, type PipeID } from './GraphOnChip';
import type { GraphVertex, Operation, Queue } from './GraphTypes';
import { OpPerfDetails, OperandDirection, OperandPerformance } from './OpPerfDetails';
import { ComputeNodeType } from './Types';
import type { CoreID } from './sources/GraphDescriptor';
import { QueueDetailsJson } from './sources/QueueDescriptor';

/** Provides common functionality for Graph Nodes.
 * Intended to be extended once for each value of `GraphVertexType`. */
export abstract class AbstractGraphVertex implements Operand {
    readonly name: GraphVertexId;

    abstract readonly vertexType: GraphVertexType;

    protected inputOperands: Map<string, Operand> = new Map();

    protected outputOperands: Map<string, Operand> = new Map();

    private pipesPerOperator: Map<string, string[]> = new Map();

    private pipesPerOperatorIndexed: Map<string, string[][]> = new Map();

    public inputPipesByCore: Map<CoreID, PipeID[]> = new Map();

    public outputPipesByCore: Map<CoreID, PipeID[]> = new Map();

    public getPipesForOperator(operator: string): string[] {
        return this.pipesPerOperator.get(operator) || [];
    }

    public setPipesForOperator(operator: string, pipeIds: string[], index: number): void {
        if (this.pipesPerOperator.has(operator)) {
            this.pipesPerOperator.get(operator)!.push(...pipeIds);
        } else {
            this.pipesPerOperator.set(operator, pipeIds);
        }
        const uniquePipeIds = [...new Set(this.pipesPerOperator.get(operator)!.map((pipeId) => pipeId.toString()))];
        this.pipesPerOperator.set(operator, uniquePipeIds);

        if (this.pipesPerOperatorIndexed.has(operator)) {
            const operatorPipeIdsIndexed = this.pipesPerOperatorIndexed.get(operator)!;
            const pipesByIndex = operatorPipeIdsIndexed[index] || [];
            operatorPipeIdsIndexed[index] = [...new Set([...pipesByIndex, ...pipeIds])];
        } else {
            const operatorPipeIdsIndexed: string[][] = [];
            operatorPipeIdsIndexed[index] = [...new Set(pipeIds)];
            this.pipesPerOperatorIndexed.set(operator, operatorPipeIdsIndexed);
        }
    }

    public getPipesForOperatorIndexed(operator: string, index: number): string[] {
        return this.pipesPerOperatorIndexed.get(operator)?.[index] || [];
    }

    public toString(): string {
        return `${this.name} (${this.vertexType})`;
    }

    public bandwidth: number = 0;

    readonly from?: GraphVertex;

    readonly to?: GraphVertex;

    readonly perCoreMapping?: [from: ComputeNode, to: ComputeNode][];

    constructor(name: string, inputOperands?: Operand[], outputOperands?: Operand[]) {
        this.name = name;
        this.assignInputs(inputOperands || []);
        this.assignOutputs(outputOperands || []);
    }

    /** All input operands */
    get inputs(): Operand[] {
        return [...this.inputOperands.values()];
    }

    /** All output operands */
    get outputs(): Operand[] {
        return [...this.outputOperands.values()];
    }

    abstract isOffchip(chipId?: number): boolean;

    assignInputs(inputs: Operand[]) {
        inputs.forEach((operand) => {
            this.inputOperands.set(operand.name, operand);
        });
    }

    assignOutputs(outputs: Operand[]) {
        outputs.forEach((operand) => {
            this.outputOperands.set(operand.name, operand);
        });
    }

    isConnected(): boolean {
        return !!(this.from && this.to);
    }
}

export class BuildableQueue extends AbstractGraphVertex implements Queue {
    readonly vertexType = GraphVertexType.QUEUE;

    details?: QueueDetailsJson;

    // eslint-disable-next-line class-methods-use-this
    isOffchip() {
        return false;
    }
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

    get slowestOperand(): Operand | null {
        const result = this.details?.slowestOperandPerformance;
        return result ? this.getOperandByPerformance(result) : null;
    }

    getOperandByPerformance(op: OperandPerformance | null): Operand | null {
        if (op) {
            if (op.direction === OperandDirection.INPUT) {
                return [...this.inputs][op.index] ?? null;
            }
            return [...this.outputs][op.index] ?? null;
        }
        return null;
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
        return [...this._cores.values()];
    }

    isOffchip(chipId?: number) {
        if (chipId === undefined) {
            return false;
        }

        if (this._cores.length === 0) {
            return true;
        }

        return this._cores[0]?.chipId !== chipId;
    }
}

export interface Operand {
    name: OperandName;
    vertexType: GraphVertexType;
    from?: GraphVertex;
    to?: GraphVertex;
    inputPipesByCore: Map<string, string[]>;
    outputPipesByCore: Map<string, string[]>;
    perCoreMapping?: [from: ComputeNode, to: ComputeNode][];

    getPipesForOperator(operator: string): string[];

    setPipesForOperator(operator: string, pipeIds: string[], index: number): void;

    getPipesForOperatorIndexed(operator: string, index: number): string[];

    isConnected(): boolean;
    isOffchip(chipId?: number): boolean;
}
