import {Loc} from './DataStructures';
import {OperationDataJSON, OperationIOJSON} from './JSONDataTypes';

export class CoreOperationsList extends Array<CoreOperationData> {
    constructor(...items: CoreOperationData[]) {
        super(...items);
        Object.setPrototypeOf(this, CoreOperationsList.prototype);
    }

    public getCoreById(coreId: string) {
        return this.find((core) => core.coreID === coreId);
    }
}

export default class DataOps {
    cores: CoreOperationData[] = [];

    operations: OperationData[] = [];

    pipesPerOp: Map<string, string[]> = new Map<string, string[]>();

    pipesPerCore: Map<string, string[]> = new Map<string, string[]>();

    pipesPerOperand: Map<string, string[]> = new Map<string, string[]>();

    coreGroupsPerOperation: Map<string, string[]> = new Map<string, string[]>();

    coreGroupsPerOperand: Map<string, string[]> = new Map<string, string[]>();

    operandsByCore: Map<string, string[]> = new Map<string, string[]>();

    operandsByCoreInputs: Map<string, string[]> = new Map<string, string[]>();

    operandsByCoreOutputs: Map<string, string[]> = new Map<string, string[]>();

    operationsByCore: Map<string, string[]> = new Map<string, string[]>();

    private organizeData(io: OperationIOJSON, operationName: string, cores: Record<string, CoreOperationData>, ioType: OpIoType) {
        const operandData = new OperandData(io.name, io.type as OperandType);
        if (!this.pipesPerOperand.has(io.name)) {
            this.pipesPerOperand.set(io.name, []);
        }
        if (!this.coreGroupsPerOperand.has(io.name)) {
            this.coreGroupsPerOperand.set(io.name, []);
        }
        Object.entries(io.pipes).forEach(([coreID, value]) => {
            if (!this.operationsByCore.has(coreID)) {
                this.operationsByCore.set(coreID, []);
            }
            this.operationsByCore.get(coreID)?.push(operationName);

            if (ioType === OpIoType.INPUTS) {
                if (!this.operandsByCoreInputs.has(coreID)) {
                    this.operandsByCoreInputs.set(coreID, []);
                }
                this.operandsByCoreInputs.get(coreID)?.push(io.name);
            }
            if (ioType === OpIoType.OUTPUTS) {
                if (!this.operandsByCoreOutputs.has(coreID)) {
                    this.operandsByCoreOutputs.set(coreID, []);
                }
                this.operandsByCoreOutputs.get(coreID)?.push(io.name);
            }

            if (!this.operandsByCore.has(coreID)) {
                this.operandsByCore.set(coreID, []);
            }
            this.operandsByCore.get(coreID)?.push(io.name);

            this.pipesPerOperand.get(io.name)?.push(...value);
            this.pipesPerOp.get(operationName)?.push(...value);

            operandData.pipes.push(PipeOperationData.fromOpsJSON(coreID, value));
            const coreOperandData = new OperandData(io.name, io.type as OperandType);
            const pipeOperation = PipeOperationData.fromOpsJSON(coreID, value);
            coreOperandData.pipes.push(pipeOperation);

            let core: CoreOperationData = cores[coreID];
            if (!core) {
                core = new CoreOperationData();
                core.coreID = coreID;
                core.loc = {x: parseInt(coreID.split('-')[1], 10), y: parseInt(coreID.split('-')[2], 10)};
                core.opName = operationName;
                cores[coreID] = core;
            }
            this.coreGroupsPerOperation.get(operationName)?.push(coreID);

            if (!this.pipesPerCore.has(coreID)) {
                this.pipesPerCore.set(coreID, []);
            }

            this.pipesPerCore.get(coreID)?.push(...pipeOperation.pipeIDs);
            this.coreGroupsPerOperand.get(io.name)?.push(coreID);

            // @ts-ignore
            core[ioType].push(coreOperandData);
        });
        return operandData;
    }

    fromOpsJSON(json: Record<string, OperationDataJSON>) {
        const cores: Record<string, CoreOperationData> = {};

        this.operations = Object.entries(json).map(([operationName, op]) => {
            const operation = new OperationData();
            operation.name = operationName;
            this.pipesPerOp.set(operationName, []);
            this.coreGroupsPerOperation.set(operationName, []);
            operation.inputs = op.inputs.map((input) => {
                return this.organizeData(input, operationName, cores, OpIoType.INPUTS);
            });
            operation.outputs = op.outputs.map((output) => {
                return this.organizeData(output, operationName, cores, OpIoType.OUTPUTS);
            });
            return operation;
        });
        this.cores = Object.values(cores);
        // unique values
        this.pipesPerOperand.forEach((value, key) => {
            this.pipesPerOperand.set(key, [...new Set(value)]);
        });
        this.pipesPerCore.forEach((value, key) => {
            this.pipesPerCore.set(key, [...new Set(value)]);
        });
        this.pipesPerOp.forEach((value, key) => {
            this.pipesPerOp.set(key, [...new Set(value)]);
        });
        this.coreGroupsPerOperation.forEach((value, key) => {
            this.coreGroupsPerOperation.set(key, [...new Set(value)]);
        });
        this.coreGroupsPerOperand.forEach((value, key) => {
            this.coreGroupsPerOperand.set(key, [...new Set(value)]);
        });
    }

    fromCoresJSON(json: Record<string, CoreOperationData>) {
        this.cores = Object.entries(json).map(([uid, core]) => {
            const coreOp = new CoreOperationData();
            coreOp.coreID = uid;
            coreOp.loc = core.loc;
            coreOp.logicalCoreId = core.logicalCoreId;
            coreOp.opName = core.opName;
            coreOp.opType = core.opType;
            return coreOp;
        });
    }
}

export class ioOperationGroup {
    public name: string = '';

    public ids: string[] = [];
}

export class CoreOperationData {
    public coreID: string = ''; // location

    loc: Loc = {x: 0, y: 0};

    logicalCoreId: string = '';

    opName: string = '';

    opType: string = '';

    inputs: OperandData[] = [];

    outputs: OperandData[] = [];
}

export enum OperandType {
    QUEUE = 'queue',
    OP = 'op',
}

export class OperandData {
    // public chipId: number = 0;

    public name: string = '';

    public type: OperandType;

    public pipes: PipeOperationData[] = [];

    public bandwidth: number = 0;

    constructor(name: string, type: OperandType) {
        this.name = name;
        this.type = type;
    }
}

export class PipeOperationData {
    static fromOpsJSON(key: string, pipeList: string[]) {
        const loc = key.split('-');
        return new PipeOperationData(
            //
            key,
            {x: parseInt(loc[1], 10), y: parseInt(loc[2], 10)},
            parseInt(loc[0], 10),
            pipeList
        );
    }

    public readonly coreID: string;

    public readonly chipId: number;

    public readonly loc: Loc;

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

export class OperationData {
    public name: string = '';

    public inputs: OperandData[] = [];

    public outputs: OperandData[] = [];

    // public loc: Loc = {x: 0, y: 0};

    // public uid: string = '';
}
