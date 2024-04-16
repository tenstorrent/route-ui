// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent Inc.

import { GraphVertexId, GraphVertexType, OperandName, OperationName } from './GraphNames';
import { ComputeNode } from './GraphOnChip';
import type { GraphVertex, Operation, Queue } from './GraphTypes';
import { OpPerfDetails, OperandDirection, OperandPerformance } from './OpPerfDetails';
import { ComputeNodeType } from './Types';
import { QueueDetailsJson } from './sources/QueueDescriptor';

/** Provides common functionality for Graph Nodes.
 * Intended to be extended once for each value of `GraphVertexType`. */
export abstract class AbstractGraphVertex implements Operand {
    readonly name: GraphVertexId;

    abstract readonly vertexType: GraphVertexType;

    abstract get isOffchip(): boolean;

    protected inputOperands: Operand[];

    protected outputOperands: Operand[];

    private _pipeIdsByCore: Map<string, string[]> = new Map();

    private pipesPerOperator: Map<string, string[]> = new Map();

    private pipesPerOperatorIndexed: Map<string, string[][]> = new Map();

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

    public get pipeIdsByCore(): Map<string, string[]> {
        return this._pipeIdsByCore;
    }

    public set pipeIdsByCore(value: Map<string, string[]>) {
        if (this._pipeIdsByCore.size > 0) {
            value.forEach((pipeIds, coreId) => {
                if (this._pipeIdsByCore.has(coreId)) {
                    this._pipeIdsByCore.get(coreId)!.push(...pipeIds);
                } else {
                    this._pipeIdsByCore.set(coreId, pipeIds);
                }
            });
        }

        this._pipeIdsByCore = value;

        this._pipeIdsByCore.forEach((pipeIds, coreId) => {
            this._pipeIdsByCore.set(coreId, [...new Set(pipeIds.map((pipeId) => pipeId.toString()))]);
        });
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
        return this.inputOperands;
    }

    /** All output operands */
    get outputs(): Operand[] {
        return this.outputOperands;
    }

    assignInputs(inputs: Operand[]) {
        this.inputOperands = [...this.inputOperands, ...inputs];
    }

    assignOutputs(outputs: Operand[]) {
        this.outputOperands = [...this.outputOperands, ...outputs];
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

    get isOffchip(): boolean {
        // TODO: requires implementation
        return false;
    }

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

    get slowestOperand(): Operand | null {
        const result = this.details?.slowestOperandPerformance;
        return result ? this.getOperandByPerformance(result) : null;
    }

    getOperandByPerformance(op: OperandPerformance | null): Operand | null {
        if (op) {
            if (op.direction === OperandDirection.INPUT) {
                return [...this.inputs][op.index];
            }
            return [...this.outputs][op.index];
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
        return this._cores.values();
    }

    get isOffchip(): boolean {
        return this._cores.length === 0;
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

    getPipesForOperator(operator: string): string[];

    setPipesForOperator(operator: string, pipeIds: string[], index: number): void;

    getPipesForOperatorIndexed(operator: string, index: number): string[];

    getPipeIdsForCore(coreId: string): string[];

    getAllPipeIds(): Iterable<string[]>;

    isConnected(): boolean;

    isOffchip: boolean;
}
