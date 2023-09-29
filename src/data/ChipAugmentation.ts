import { Loc } from './Types';

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
export class Operation {
    /** Name of the operation. */
    public name: string = '';

    /** Array of input operand data. */
    public inputs: Operand[] = [];

    /** Array of output operand data. */
    public outputs: Operand[] = [];
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

    /** Name of the operation. */
    opName: string = '';

    /** label only */
    opType: string = '';
}

export enum OperandType {
    QUEUE = 'queue',
    OP = 'op',
}

/**
 * Represents the data structure for an operand.
 */
export class Operand {
    /** Name of the operand. */
    public name: string = '';

    /** Type of the operand (e.g., QUEUE or OP). */
    public type: OperandType;

    public pipeIdsByCore: Map<string, string[]> = new Map<string, string[]>();

    /** Bandwidth associated with the operand. */
    public bandwidth: number = 0;

    constructor(name: string, type: OperandType) {
        this.name = name;
        this.type = type;
    }

    public getPipeIdsForCore(coreId: string): string[] {
        return this.pipeIdsByCore.get(coreId) || [];
    }

    public getAllPipeIds(){
        return this.pipeIdsByCore.values();
    }
}

export enum OpIoType {
    INPUTS = 'inputs',
    OUTPUTS = 'outputs',
}
