import { Loc } from './Types';
import type { OpGraphNode, OperationName, OperandName } from './GraphTypes';
import { OpGraphNodeType } from './GraphTypes';

export class CoreOperationsList extends Array<CoreOperation> {
    constructor(...items: CoreOperation[]) {
        super(...items);
        Object.setPrototypeOf(this, CoreOperationsList.prototype);
    }

    public getCoreById(coreId: string) {
        return this.find((core) => core.coreID === coreId);
    }
}

/**
 * Represents the data structure for an operation.
 * matches operation centric data structure
 */
export class Operation implements OpGraphNode {
    /** Name of the operation. */
    readonly name: OperationName;

    readonly nodeType = OpGraphNodeType.OPERATION;

    protected inputOperands: Operand[];

    protected outputOperands: Operand[];

    constructor(name: string, inputOperands: Operand[], outputOperands: Operand[]) {
        this.name = name;
        this.inputOperands = inputOperands;
        this.outputOperands = outputOperands;
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

/**
 * Represents the data structure for a core specific operation, which extends the operation data.
 * matches core centric data structure
 */
export class CoreOperation extends Operation {
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
    public name: OperandName;

    /** Type of the operand (e.g., QUEUE or OP). */
    public type: OpGraphNodeType;

    public pipeIdsByCore: Map<string, string[]> = new Map<string, string[]>();

    /** Bandwidth associated with the operand. */
    public bandwidth: number = 0;

    constructor(name: string, type: OpGraphNodeType) {
        this.name = name;
        this.type = type;
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
