import {Loc} from './DataStructures';

export class CoreOperationsList extends Array<CoreOperation> {
    constructor(...items: CoreOperation[]) {
        super(...items);
        Object.setPrototypeOf(this, CoreOperationsList.prototype);
    }

    public getCoreById(coreId: string) {
        return this.find((core) => core.coreID === coreId);
    }
}


export class ioOperationGroup {
    public name: string = '';

    public ids: string[] = [];
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
    loc: Loc = {x: 0, y: 0};

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

    /** Array of pipe operation data. */
    public pipeOperations: PipeOperation[] = [];

    /** Bandwidth associated with the operand. */
    public bandwidth: number = 0;

    constructor(name: string, type: OperandType) {
        this.name = name;
        this.type = type;
    }
}

/**
 * Pipe to core to operand relationship
 */
export class PipeOperation {
    /**
     * A static method to create a PipeOperationData instance from a JSON structure.
     * @param {string} key - The key in the JSON.
     * @param {string[]} pipeList - The list of pipes.
     * @returns {PipeOperation} - An instance of PipeOperationData.
     */
    static fromOpsJSON(key: string, pipeList: string[]) {
        const loc = key.split('-');
        return new PipeOperation(key, {x: parseInt(loc[1], 10), y: parseInt(loc[2], 10)}, parseInt(loc[0], 10), pipeList);
    }

    public readonly coreID: string;

    /** Identifier for the chip. Specific to multichip */
    public readonly chipId: number;

    public readonly loc: Loc;

    /** Array of pipe ids. */
    public readonly pipeIDs: string[];

    constructor(coreID: string, loc: Loc, chipId: number, pipes: string[]) {
        this.coreID = coreID;
        this.loc = loc;
        this.chipId = chipId;
        this.pipeIDs = pipes.map((pipe) => pipe.toString());
    }
}

export enum OpIoType {
    INPUTS = 'inputs',
    OUTPUTS = 'outputs',
}
