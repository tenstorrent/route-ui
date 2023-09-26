import {LinkStateData, ComputeNodeState, PipeSelection, loadIoDataIn, loadIoDataOut} from './store';
import {DramChannelJSON, NetlistAnalyzerDataJSON, NOCLinkJSON, NodeDataJSON, OperationDataJSON, OperandJSON} from './JSONDataTypes';
import {CoreOperation, Operand, OperandType, Operation, OpIoType, PipeOperation} from './ChipAugmentation';
import ChipDesign, {ChipDesignJSON} from './ChipDesign';

export enum LinkName {
    NONE = 'none',
    NOC0_IN = 'noc0_link_in',
    NOC0_OUT = 'noc0_link_out',
    NOC0_NORTH_IN = 'noc0_in_north',
    NOC0_SOUTH_OUT = 'noc0_out_south',
    NOC0_WEST_IN = 'noc0_in_west',
    NOC0_EAST_OUT = 'noc0_out_east',
    NOC1_IN = 'noc1_link_in',
    NOC1_OUT = 'noc1_link_out',
    NOC1_WEST_OUT = 'noc1_out_west',
    NOC1_EAST_IN = 'noc1_in_east',
    NOC1_SOUTH_IN = 'noc1_in_south',
    NOC1_NORTH_OUT = 'noc1_out_north',
}

export enum ARCHITECTURE {
    NONE = '',
    GRAYSKULL = 'grayskull',
    WORMHOLE = 'wormhole',
}

export enum DramName {
    NOC_IN = 'noc_in',
    NOC_OUT = 'noc_out',
    NOC0_NOC2AXI = 'noc0_noc2axi',
    NOC1_NOC2AXI = 'noc1_noc2axi',
    DRAM_INOUT = 'dram_inout',
    DRAM0_INOUT = 'dram0_inout',
    DRAM1_INOUT = 'dram1_inout',
}

export enum ComputeNodeType {
    NONE = '',
    ROUTER = 'router',
    CORE = 'core',
    DRAM = 'dram',
    ETHERNET = 'eth',
    PCIE = 'pcix',
}

export type Loc = {
    x: number;
    y: number;
};

export enum NOC {
    NOC0 = 'noc0',
    NOC1 = 'noc1',
}

export default class Chip {
    private static NOC_ORDER: Map<LinkName, number>;

    public static GET_NOC_ORDER(): Map<LinkName, number> {
        if (!Chip.NOC_ORDER) {
            Chip.NOC_ORDER = new Map(
                Object.keys(LinkName)
                    .map((key) => LinkName[key])
                    .map((noc, index) => [noc, index])
            );
        }

        return Chip.NOC_ORDER;
    }

    private _chipId: number = 0;

    public get chipId(): number {
        return this._chipId;
    }

    protected set chipId(value: number) {
        this._chipId = value;
    }

    private _nodes: ComputeNode[] = [];

    public get nodes(): ComputeNode[] {
        return this._nodes;
    }

    protected set nodes(value: ComputeNode[]) {
        this._nodes = value;
    }

    private _totalCols: number = 0;

    public get totalCols(): number {
        return this._totalCols;
    }

    protected set totalCols(value: number) {
        this._totalCols = value;
    }

    private _totalRows: number = 0;

    public get totalRows(): number {
        return this._totalRows;
    }

    protected set totalRows(value: number) {
        this._totalRows = value;
    }

    private _slowestOpCycles: number = 0;

    public get slowestOpCycles(): number {
        return this._slowestOpCycles;
    }

    protected set slowestOpCycles(value: number) {
        this._slowestOpCycles = value;
    }

    private _bwLimitedOpCycles: number = 0;

    public get bwLimitedOpCycles(): number {
        return this._bwLimitedOpCycles;
    }

    protected set bwLimitedOpCycles(value: number) {
        this._bwLimitedOpCycles = value;
    }

    private _architecture: ARCHITECTURE = ARCHITECTURE.NONE;

    public get architecture(): ARCHITECTURE {
        return this._architecture;
    }

    protected set architecture(value: ARCHITECTURE) {
        this._architecture = value;
    }

    private uniquePipeList: Pipe[] = [];

    private _dramChannels: DramChannel[] = [];

    public get dramChannels(): DramChannel[] {
        return this._dramChannels;
    }

    protected set dramChannels(value: DramChannel[]) {
        this._dramChannels = value;
    }

    private _totalOpCycles: number = 0;

    public get totalOpCycles(): number {
        return this._totalOpCycles;
    }

    protected set totalOpCycles(value: number) {
        this._totalOpCycles = value;
    }

    // augmented data

    private _operations: Operation[] = [];

    /**
     * Array of operation data.
     */
    public get operations(): Operation[] {
        return this._operations;
    }

    protected set operations(value: Operation[]) {
        this._operations = value;
    }

    private _cores: CoreOperation[] = [];

    /**
     * Array of core operation data.
     */
    public get cores(): CoreOperation[] {
        return this._cores;
    }

    protected set cores(value: CoreOperation[]) {
        this._cores = value;
    }

    private _pipesPerOp: Map<string, string[]> = new Map<string, string[]>();

    /**
     * Map of operation name to pipe IDs.
     */
    public get pipesPerOp(): Map<string, string[]> {
        return this._pipesPerOp;
    }

    protected set pipesPerOp(value: Map<string, string[]>) {
        this._pipesPerOp = value;
    }

    private _pipesPerCore: Map<string, string[]> = new Map<string, string[]>();

    public get pipesPerCore(): Map<string, string[]> {
        return this._pipesPerCore;
    }

    protected set pipesPerCore(value: Map<string, string[]>) {
        this._pipesPerCore = value;
    }

    private _pipesPerOperand: Map<string, string[]> = new Map<string, string[]>();

    /**
     * Map of operand name to pipe IDs.
     */
    public get pipesPerOperand(): Map<string, string[]> {
        return this._pipesPerOperand;
    }

    protected set pipesPerOperand(value: Map<string, string[]>) {
        this._pipesPerOperand = value;
    }

    private _coreGroupsPerOperation: Map<string, string[]> = new Map<string, string[]>();

    /**
     * Map of operation name to core IDs.
     */
    public get coreGroupsPerOperation(): Map<string, string[]> {
        return this._coreGroupsPerOperation;
    }

    protected set coreGroupsPerOperation(value: Map<string, string[]>) {
        this._coreGroupsPerOperation = value;
    }

    private _coreGroupsPerOperand: Map<string, string[]> = new Map<string, string[]>();

    /**
     * Map of operand name to core IDs.
     */
    public get coreGroupsPerOperand(): Map<string, string[]> {
        return this._coreGroupsPerOperand;
    }

    protected set coreGroupsPerOperand(value: Map<string, string[]>) {
        this._coreGroupsPerOperand = value;
    }

    private _operandsByCore: Map<string, string[]> = new Map<string, string[]>();

    /**
     * Map of core ID to operand names.
     */
    public get operandsByCore(): Map<string, string[]> {
        return this._operandsByCore;
    }

    protected set operandsByCore(value: Map<string, string[]>) {
        this._operandsByCore = value;
    }

    private _operationsByCore: Map<string, string[]> = new Map<string, string[]>();

    /**
     * Map of core ID to operation names.
     */
    public get operationsByCore(): Map<string, string[]> {
        return this._operationsByCore;
    }

    protected set operationsByCore(value: Map<string, string[]>) {
        this._operationsByCore = value;
    }

    constructor() {
        Chip.GET_NOC_ORDER();
    }

    public static CREATE_FROM_NETLIST_JSON(data: NetlistAnalyzerDataJSON) {
        const chip = new Chip();
        chip.slowestOpCycles = data.slowest_op_cycles;
        chip.bwLimitedOpCycles = data.bw_limited_op_cycles;
        chip.chipId = data.chip_id || 0;

        if (data.arch) {
            if (data.arch.includes(ARCHITECTURE.GRAYSKULL)) {
                chip.architecture = ARCHITECTURE.GRAYSKULL;
            }
            if (data.arch.includes(ARCHITECTURE.WORMHOLE)) {
                chip.architecture = ARCHITECTURE.WORMHOLE;
            }
        }

        chip.totalOpCycles = Math.min(chip.slowestOpCycles, chip.bwLimitedOpCycles);

        chip.nodes = data.nodes
            .map((nodeJSON) => {
                const loc: Loc = {x: nodeJSON.location[1], y: nodeJSON.location[0]};
                chip.totalCols = Math.max(loc.y, chip.totalCols);
                chip.totalRows = Math.max(loc.x, chip.totalRows);
                const node = new ComputeNode(`${chip.chipId}-${nodeJSON.location[1]}-${nodeJSON.location[0]}`);
                node.fromNetlistJSON(nodeJSON, chip.chipId);
                return node;
            })
            .sort((a, b) => {
                if (a.loc.y !== b.loc.y) {
                    return a.loc.y - b.loc.y;
                }
                return a.loc.x - b.loc.x;
            });

        if (data.dram_channels) {
            chip.dramChannels = data.dram_channels.map((dramChannel) => {
                return new DramChannel(dramChannel.channel_id, dramChannel);
            });
        }

        return chip;
    }

    public static AUGMENT_FROM_OPS_JSON(chip: Chip, json: Record<string, OperationDataJSON>): Chip {
        if (chip) {
            const augmentedChip = new Chip();
            Object.assign(augmentedChip, chip);

            const organizeData = (operandJSON: OperandJSON, operationName: string, cores: Record<string, CoreOperation>, ioType: OpIoType) => {
                const operandData = new Operand(operandJSON.name, operandJSON.type as OperandType);
                if (!augmentedChip.pipesPerOperand.has(operandJSON.name)) {
                    augmentedChip.pipesPerOperand.set(operandJSON.name, []);
                }
                if (!augmentedChip.coreGroupsPerOperand.has(operandJSON.name)) {
                    augmentedChip.coreGroupsPerOperand.set(operandJSON.name, []);
                }
                Object.entries(operandJSON.pipes).forEach(([coreID, value]) => {
                    if (!augmentedChip.operationsByCore.has(coreID)) {
                        augmentedChip.operationsByCore.set(coreID, []);
                    }
                    augmentedChip.operationsByCore.get(coreID)?.push(operationName);

                    if (!augmentedChip.operandsByCore.has(coreID)) {
                        augmentedChip.operandsByCore.set(coreID, []);
                    }
                    augmentedChip.operandsByCore.get(coreID)?.push(operandJSON.name);

                    augmentedChip.pipesPerOperand.get(operandJSON.name)?.push(...value);
                    augmentedChip.pipesPerOp.get(operationName)?.push(...value);

                    operandData.pipeOperations.push(PipeOperation.fromOpsJSON(coreID, value));
                    const coreOperandData = new Operand(operandJSON.name, operandJSON.type as OperandType);
                    const pipeOperation = PipeOperation.fromOpsJSON(coreID, value);
                    coreOperandData.pipeOperations.push(pipeOperation);

                    let core: CoreOperation = cores[coreID];
                    if (!core) {
                        core = new CoreOperation();
                        core.coreID = coreID;
                        core.loc = {x: parseInt(coreID.split('-')[1], 10), y: parseInt(coreID.split('-')[2], 10)};
                        core.opName = operationName;
                        cores[coreID] = core;
                    }
                    augmentedChip.coreGroupsPerOperation.get(operationName)?.push(coreID);

                    if (!augmentedChip.pipesPerCore.has(coreID)) {
                        augmentedChip.pipesPerCore.set(coreID, []);
                    }

                    augmentedChip.pipesPerCore.get(coreID)?.push(...pipeOperation.pipeIDs);
                    augmentedChip.coreGroupsPerOperand.get(operandJSON.name)?.push(coreID);

                    // @ts-ignore
                    core[ioType].push(coreOperandData);
                });
                return operandData;
            };
            const cores: Record<string, CoreOperation> = {};

            augmentedChip.operations = Object.entries(json).map(([operationName, op]) => {
                const operation = new Operation();
                operation.name = operationName;
                augmentedChip.pipesPerOp.set(operationName, []);
                augmentedChip.coreGroupsPerOperation.set(operationName, []);
                operation.inputs = op.inputs.map((input) => {
                    return organizeData(input, operationName, cores, OpIoType.INPUTS);
                });
                operation.outputs = op.outputs.map((output) => {
                    return organizeData(output, operationName, cores, OpIoType.OUTPUTS);
                });
                return operation;
            });
            augmentedChip.cores = Object.values(cores);
            // unique values
            augmentedChip.pipesPerOperand.forEach((value, key) => {
                augmentedChip.pipesPerOperand.set(key, [...new Set(value)]);
            });
            augmentedChip.pipesPerCore.forEach((value, key) => {
                augmentedChip.pipesPerCore.set(key, [...new Set(value)]);
            });
            augmentedChip.pipesPerOp.forEach((value, key) => {
                augmentedChip.pipesPerOp.set(key, [...new Set(value)]);
            });
            augmentedChip.coreGroupsPerOperation.forEach((value, key) => {
                augmentedChip.coreGroupsPerOperation.set(key, [...new Set(value)]);
            });
            augmentedChip.coreGroupsPerOperand.forEach((value, key) => {
                augmentedChip.coreGroupsPerOperand.set(key, [...new Set(value)]);
            });

            // augmentedChip.operations = chipAugmentation.operations;
            // augmentedChip.cores = chipAugmentation.cores;
            // augmentedChip.pipesPerOp = chipAugmentation.pipesPerOp;
            // augmentedChip.pipesPerOperand = chipAugmentation.pipesPerOperand;
            // augmentedChip.pipesPerCore = chipAugmentation.pipesPerCore;
            // augmentedChip.coreGroupsPerOperation = chipAugmentation.coreGroupsPerOperation;
            // augmentedChip.coreGroupsPerOperand = chipAugmentation.coreGroupsPerOperand;
            // augmentedChip.operationsByCore = chipAugmentation.operationsByCore;
            // augmentedChip.operandsByCore = chipAugmentation.operandsByCore;

            return augmentedChip;
        }
        throw new Error('Chip is null');
    }

    public static CREATE_FROM_CHIP_DESIGN(json: ChipDesignJSON) {
        const chipDesign = new ChipDesign(json);
        const chip = new Chip();
        chip.nodes = chipDesign.nodes.map((simpleNode) => {
            const node = new ComputeNode(`0-${simpleNode.loc.x}-${simpleNode.loc.y}`);
            node.type = simpleNode.type;
            node.loc = simpleNode.loc;
            node.dramChannel = simpleNode.dramChannel;
            node.dramSubchannel = simpleNode.dramSubchannel;
            return node;
        });
        chip.totalRows = chipDesign.totalRows;
        chip.totalCols = chipDesign.totalCols;
        return chip;
    }

    // TODO: needs a better anme to represent update from perf analyser data
    public static AUGMENT_FROM_CORES_JSON(chip: Chip, json: Record<string, CoreOperation>): Chip {
        if (chip) {
            const augmentedChip = new Chip();
            Object.assign(augmentedChip, chip);

            augmentedChip.cores = Object.entries(json).map(([uid, core]) => {
                const coreOp = new CoreOperation();
                coreOp.coreID = uid;
                coreOp.loc = core.loc;
                coreOp.logicalCoreId = core.logicalCoreId;
                coreOp.opName = core.opName;
                coreOp.opType = core.opType;
                return coreOp;
            });

            return augmentedChip;
        }
        throw new Error('Chip is null');
    }

    getAllNodes(): ComputeNodeState[] {
        return this.nodes.map((node) => {
            return {
                id: node.uid,
                selected: false,
                loc: node.loc,
                opName: node.opName,
                dramChannel: node.dramChannel,
                dramSubchannel: node.dramSubchannel,
            } as ComputeNodeState;
        });
    }

    getAllPipeIds(): PipeSelection[] {
        const allPipes: PipeSelection[] = [];
        this.nodes.forEach((node) => {
            node.links.forEach((link) => {
                const pipes = link.pipes.map((pipe) => {
                    return {id: pipe.id, selected: false};
                });
                allPipes.push(...pipes);
            });
        });

        return Array.from(
            new Set(
                allPipes.map((pipeSelection) => {
                    return {id: pipeSelection.id, selected: false};
                })
            )
        );
    }

    getPipeInfo(pipeId: string): ComputeNodeExtended[] {
        const list: ComputeNodeExtended[] = [];
        this.nodes.forEach((node) => {
            let hasPipe = false;
            node.links.forEach((link) => {
                if (link.pipes.filter((pipe) => pipe.id === pipeId).length > 0) {
                    hasPipe = true;
                }
            });
            if (hasPipe) {
                const extendedNodeData = new ComputeNodeExtended(node);
                extendedNodeData.coreOperationData = this.cores.find((core) => core.coreID === node.uid) || null;
                list.push(extendedNodeData);
            }
        });
        return list;
    }

    getAllLinks(): LinkStateData[] {
        const links: GenericNOCLink[] = [];
        this.nodes.forEach((node) => {
            node.links.forEach((link) => {
                links.push(link);
            });
        });
        this.dramChannels.forEach((dramChannel) => {
            dramChannel.links.forEach((link) => {
                links.push(link);
                dramChannel.subchannels.forEach((subchannel) => {
                    subchannel.links.forEach((subchannelLink) => {
                        links.push(subchannelLink);
                    });
                });
            });
        });

        return links.map((link) => ({
            id: link.uid,
            totalDataBytes: link.totalDataBytes,
            bpc: 0,
            saturation: 0,
            maxBandwidth: link.maxBandwidth,
        }));
    }

    get allUniquePipes(): Pipe[] {
        if (!this.uniquePipeList.length) {
            this.uniquePipeList = this.getAllPipes();
        }
        return this.uniquePipeList;
    }

    private getAllPipes(): Pipe[] {
        let list: Pipe[] = [];
        this.nodes.forEach((node) => {
            node.links.forEach((link) => {
                list.push(...link.pipes);
            });
        });
        const uniquePipeObj: {[key: string]: Pipe} = {};
        for (let i = 0; i < list.length; i++) {
            uniquePipeObj[list[i].id] = list[i];
        }
        list = Object.values(uniquePipeObj).sort((a, b) => {
            if (a.id < b.id) {
                return -1;
            }
            if (a.id > b.id) {
                return 1;
            }
            return 0;
        });

        return list;
    }
}

export class DramChannel {
    public id: number;

    public subchannels: DramSubchannel[] = [];

    public links: DramLink[] = [];

    constructor(id: number, json: DramChannelJSON) {
        this.id = id;
        if (json.subchannels) {
            this.subchannels = json.subchannels.map((subchannel, i) => {
                return new DramSubchannel(i, id, subchannel);
            });
            if (json.dram_inout) this.links.push(new DramLink(DramName.DRAM_INOUT, `${id}-${DramName.DRAM_INOUT}`, json.dram_inout));
            if (json.dram0_inout) this.links.push(new DramLink(DramName.DRAM0_INOUT, `${id}-${DramName.DRAM0_INOUT}`, json.dram0_inout));
            if (json.dram1_inout) this.links.push(new DramLink(DramName.DRAM1_INOUT, `${id}-${DramName.DRAM1_INOUT}`, json.dram1_inout));
        }
    }
}

export class DramSubchannel {
    public subchannelId: number;

    public links: DramLink[] = [];

    constructor(subchannelId: number, channelId: number, json: {[key: string]: NOCLinkJSON}) {
        this.subchannelId = subchannelId;
        Object.entries(json).forEach(([key, value]) => {
            this.links.push(new DramLink(key as DramName, `${channelId}-${subchannelId}-${key}`, value));
        });
    }
}

export class GenericNOCLink {
    public uid: string;

    public name?: string;

    public numOccupants: number = 0;

    public totalDataBytes: number = 0;

    public maxBandwidth: number = 0;

    public pipes: Pipe[] = [];

    public noc: NOC;

    constructor(name: string, uid: string, json: NOCLinkJSON) {
        this.uid = uid;
        this.numOccupants = json.num_occupants;
        this.totalDataBytes = json.total_data_in_bytes;
        this.maxBandwidth = json.max_link_bw;
        this.noc = name.includes('noc0') ? NOC.NOC0 : NOC.NOC1;
        this.pipes = Object.entries(json.mapped_pipes).map(([pipe, bandwidth]) => new Pipe(pipe, bandwidth, name, this.totalDataBytes));
    }
}

export class DramLink extends GenericNOCLink {
    public name: DramName;

    constructor(name: DramName, uid: string, json: NOCLinkJSON) {
        super(name, uid, json);
        this.name = name as DramName;

        if (name.includes('dram')) {
            this.noc = name.includes('dram0') ? NOC.NOC0 : NOC.NOC1;
        }
    }
}

export class NOCLink extends GenericNOCLink {
    public name: LinkName;

    constructor(name: LinkName, uid: string, json: NOCLinkJSON) {
        super(name, uid, json);
        this.name = name;
    }
}

export class ComputeNode {
    static fromNetlistJSON(nodeJSON: NodeDataJSON) {
        return new ComputeNode(`0-${nodeJSON.location[1]}-${nodeJSON.location[0]}`);
    }

    /**
     * Chip ID in a multichip data scenario. NOT node id.
     */
    public chipId: number = 0;

    /**
     * Unique ID for the node.
     */
    public uid: string;

    public type: ComputeNodeType = ComputeNodeType.NONE;

    public loc: Loc = {x: 0, y: 0};

    public opName: string = '';

    public opCycles: number = 0;

    public links: Map<any, NOCLink> = new Map();

    /**
     * only relevant for dram nodes
     */
    public dramSubchannel: number = 0;

    /**
     * only relevant for dram nodes
     */
    public dramChannel: number = -1;

    constructor(uid: string) {
        this.uid = uid;
    }

    public fromNetlistJSON(json: NodeDataJSON, chipId: number = 0) {
        // this.uid = uid;
        this.opName = json.op_name;
        this.opCycles = json.op_cycles;
        this.links = new Map();
        this.chipId = chipId;

        this.type = json.type as ComputeNodeType;
        if (json.dram_channel !== undefined && json.dram_channel !== null) {
            this.dramChannel = json.dram_channel;
            this.dramSubchannel = json.dram_subchannel || 0;
        }
        this.loc = {x: json.location[0], y: json.location[1]};
        this.uid = `${chipId}-${this.loc.y}-${this.loc.x}`;

        const linkId = `${this.loc.x}-${this.loc.y}`;

        this.links = new Map(Object.entries(json.links).map(([link, linkJson], index) => [link, new NOCLink(link as LinkName, `${linkId}-${index}`, linkJson)]));
    }

    public getPipesForDirection(direction: LinkName): string[] {
        return this.links.get(direction)?.pipes.map((pipe) => pipe.id) || [];
    }

    public getNodeLabel(): string {
        if (this.type === ComputeNodeType.CORE) {
            return 'c';
        }
        if (this.type === ComputeNodeType.ROUTER) {
            return 'r';
        }
        if (this.type === ComputeNodeType.DRAM) {
            return 'd';
        }
        if (this.type === ComputeNodeType.ETHERNET) {
            return 'e';
        }
        if (this.type === ComputeNodeType.PCIE) {
            return 'p';
        }
        return '';
    }
}

export class ComputeNodeExtended extends ComputeNode {
    public coreOperationData: CoreOperation | null;

    constructor(data: ComputeNode) {
        super(data.uid);
        Object.assign(this, data);
    }
}

export class Pipe {
    id: string = '';

    location: Loc = {x: 0, y: 0};

    bandwidth: number = 0;

    nocId: string = '';

    bandwidthUse: number = 0;

    constructor(id: string, bandwidth: number, nocId: string = '', linkTotalData: number = 0) {
        this.id = id;
        this.nocId = nocId;
        this.bandwidth = bandwidth;
        this.bandwidthUse = (this.bandwidth / linkTotalData) * 100;
    }
}

export const convertBytes = (bytes: number, numAfterComma = 0) => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];

    if (bytes === 0) {
        return '0 B';
    }
    if (bytes < 1) {
        return `${bytes.toFixed(numAfterComma)} B`;
    }

    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / 1024 ** i).toFixed(numAfterComma)} ${sizes[i]}`;
};

export const updateOPCycles = (link: LinkStateData, totalOpCycles: number) => {
    link.bpc = link.totalDataBytes / totalOpCycles;
    link.saturation = (link.bpc / link.maxBandwidth) * 100;
};
