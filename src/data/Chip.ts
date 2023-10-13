import {
    ChipDesignJSON,
    DramChannelJSON,
    NetlistAnalyzerDataJSON,
    NOCLinkJSON,
    NodeDataJSON,
    OperandJSON,
    OperationDataJSON,
} from './JSONDataTypes';
import { CoreOperation, Operand, Operation, OpIoType } from './ChipAugmentation';
import ChipDesign from './ChipDesign';
import { ComputeNodeState, LinkState, PipeSelection } from './StateTypes';
import {
    Architecture,
    ComputeNodeType,
    DRAMBank,
    DramBankLinkName,
    DramNOCLinkName, LinkType,
    Loc,
    NetworkLinkName,
    NOC,
    NOCLinkName
} from './Types';
import { INTERNAL_LINK_NAMES, NOC_LINK_NAMES } from './constants';
import { OperationName, OpGraphNodeType } from './GraphTypes';
import { reduceIterable } from "../utils/IterableHelpers";

export default class Chip {
    private static NOC_ORDER: Map<NOCLinkName, number>;

    public static GET_NOC_ORDER(): Map<NOCLinkName, number> {
        if (!Chip.NOC_ORDER) {
            Chip.NOC_ORDER = new Map(
                Object.keys(NOCLinkName)
                    .map((key) => NOCLinkName[key])
                    .map((noc, index) => [noc, index]),
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

    private _architecture: Architecture = Architecture.NONE;

    public get architecture(): Architecture {
        return this._architecture;
    }

    protected set architecture(value: Architecture) {
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

    /**
     * Iterates over all operations.
     */
    public get operations(): Iterable<Operation> {
        return this.operationsByName.values();
    }

    protected set operations(value: Iterable<Operation>) {
        this.operationsByName = reduceIterable(
            value,
            new Map<OperationName, Operation>(),
            (opMap, currentOp) => opMap.set(currentOp.name, currentOp),
        );
    }

    private operationsByName: Map<OperationName, Operation>;

    public getOperation(name: OperationName) {
        return this.operationsByName.get(name);
    }

    private _coreOps: CoreOperation[] = [];

    /**
     * Array of core operation data.
     */
    public get coreOps(): CoreOperation[] {
        return this._coreOps;
    }

    protected set coreOps(value: CoreOperation[]) {
        this._coreOps = value;
    }

    private _pipesPerOp: Map<string, string[]> = new Map<string, string[]>();

    /**
     * Map of operation name to pipe IDs.
     */
    public get pipesPerOp(): Map<string, string[]> {
        return this._pipesPerOp;
    }

    private _pipesPerOperand: Map<string, string[]> = new Map<string, string[]>();

    /**
     * Map of operand name to pipe IDs.
     */
    public get pipesPerOperand(): Map<string, string[]> {
        return this._pipesPerOperand;
    }

    constructor() {
        this.operationsByName = new Map();
        Chip.GET_NOC_ORDER();
    }

    public static CREATE_FROM_NETLIST_JSON(data: NetlistAnalyzerDataJSON) {
        const chip = new Chip();
        chip.slowestOpCycles = data.slowest_op_cycles;
        chip.bwLimitedOpCycles = data.bw_limited_op_cycles;
        chip.chipId = data.chip_id || 0;

        if (data.arch) {
            if (data.arch.includes(Architecture.GRAYSKULL)) {
                chip.architecture = Architecture.GRAYSKULL;
            }
            if (data.arch.includes(Architecture.WORMHOLE)) {
                chip.architecture = Architecture.WORMHOLE;
            }
        }

        chip.totalOpCycles = Math.min(chip.slowestOpCycles, chip.bwLimitedOpCycles);

        chip.nodes = data.nodes
            .map((nodeJSON) => {
                const loc: Loc = { x: nodeJSON.location[1], y: nodeJSON.location[0] };
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

    public static AUGMENT_FROM_OPS_JSON(chip: Chip, operationsJson: Record<string, OperationDataJSON>): Chip {
        if (chip) {
            const augmentedChip = new Chip();
            Object.assign(augmentedChip, chip);

            const organizeData = (
                operandJSON: OperandJSON,
                operationName: string,
                coreOps: Record<string, CoreOperation>,
                ioType: OpIoType,
            ) => {
                const operandData = new Operand(operandJSON.name, operandJSON.type as OpGraphNodeType);
                if (!augmentedChip.pipesPerOperand.has(operandJSON.name)) {
                    augmentedChip.pipesPerOperand.set(operandJSON.name, []);
                }

                Object.entries(operandJSON.pipes).forEach(([coreID, pipes]) => {
                    const pipeList: string[] = pipes.map((pipeId) => pipeId.toString());

                    augmentedChip.pipesPerOperand.get(operandJSON.name)?.push(...pipeList);
                    augmentedChip.pipesPerOp.get(operationName)?.push(...pipeList);

                    const operand = new Operand(operandJSON.name, operandJSON.type as OpGraphNodeType);
                    operand.pipeIdsByCore.set(coreID, pipeList);

                    let coreOp: CoreOperation = coreOps[coreID];
                    if (!coreOp) {
                        coreOp = new CoreOperation(operationName, [], []);
                        coreOp.coreID = coreID;
                        coreOp.loc = { x: parseInt(coreID.split('-')[1], 10), y: parseInt(coreID.split('-')[2], 10) };
                        coreOps[coreID] = coreOp;
                    }

                    if (ioType === OpIoType.INPUTS) {
                        coreOp.inputs.push(operand);
                    } else if (ioType === OpIoType.OUTPUTS) {
                        coreOp.outputs.push(operand);
                    }
                });
                return operandData;
            };
            const cores: Record<string, CoreOperation> = {};

            augmentedChip.operations = Object.entries(operationsJson).map(([operationName, opJson]) => {
                augmentedChip.pipesPerOp.set(operationName, []);

                const inputs = opJson.inputs.map((input) => {
                    return organizeData(input, operationName, cores, OpIoType.INPUTS);
                });
                const outputs = opJson.outputs.map((output) => {
                    return organizeData(output, operationName, cores, OpIoType.OUTPUTS);
                });

                return new Operation(operationName, inputs, outputs);
            });
            augmentedChip.coreOps = Object.values(cores);
            // unique values
            augmentedChip.pipesPerOperand.forEach((value, key) => {
                augmentedChip.pipesPerOperand.set(key, [...new Set(value)]);
            });
            augmentedChip.pipesPerOp.forEach((value, key) => {
                augmentedChip.pipesPerOp.set(key, [...new Set(value)]);
            });

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

            augmentedChip.coreOps = Object.entries(json).map(([uid, core]) => {
                const coreOp = new CoreOperation(core.name, [], []);
                coreOp.coreID = uid;
                coreOp.loc = core.loc;
                coreOp.logicalCoreId = core.logicalCoreId;
                coreOp.opType = core.opType;
                return coreOp;
            });

            return augmentedChip;
        }
        throw new Error('Chip is null');
    }

    public generateInitialPipesSelectionState(): PipeSelection[] {
        return this.allUniquePipes.map((pipe) => {
            return { id: pipe.id, selected: false } as PipeSelection;
        });
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
                extendedNodeData.coreOperationData = this.coreOps.find((core) => core.coreID === node.uid) || null;
                list.push(extendedNodeData);
            }
        });
        return list;
    }

    getAllLinks(): NetworkLink[] {
        const links: NetworkLink[] = [];
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
        return links;
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
        const uniquePipeObj: { [key: string]: Pipe } = {};
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

    private addOperation(operation: Operation) {
        if (!this.getOperation(operation.name)) {
            this.operationsByName.set(operation.name, operation);
        }

    }
}

export class DramChannel {
    public id: number;

    public subchannels: DramSubchannel[] = [];

    public links: DramBankLink[] = [];

    constructor(id: number, json: DramChannelJSON) {
        this.id = id;
        if (json.subchannels) {
            this.subchannels = json.subchannels.map((subchannel, i) => {
                return new DramSubchannel(i, id, subchannel);
            });
            if (json.dram_inout) {
                this.links.push(
                    new DramBankLink(
                        DramBankLinkName.DRAM_INOUT,
                        `${id}-${DramBankLinkName.DRAM_INOUT}`,
                        json.dram_inout,
                    ),
                );
            }
            if (json.dram0_inout) {
                this.links.push(
                    new DramBankLink(
                        DramBankLinkName.DRAM0_INOUT,
                        `${id}-${DramBankLinkName.DRAM0_INOUT}`,
                        json.dram0_inout,
                    ),
                );
            }
            if (json.dram1_inout) {
                this.links.push(
                    new DramBankLink(
                        DramBankLinkName.DRAM1_INOUT,
                        `${id}-${DramBankLinkName.DRAM1_INOUT}`,
                        json.dram1_inout,
                    ),
                );
            }
        }
    }
}

export class DramSubchannel {
    public subchannelId: number;

    public links: DramNOCLink[] = [];

    constructor(subchannelId: number, channelId: number, json: { [key: string]: NOCLinkJSON }) {
        this.subchannelId = subchannelId;
        Object.entries(json).forEach(([key, value]) => {
            this.links.push(NetworkLink.CREATE(key as DramNOCLinkName, `${channelId}-${subchannelId}-${key}`, value) as DramNOCLink);
        });
    }
}

export abstract class NetworkLink {

    abstract type: LinkType;

    readonly uid: string;

    public readonly name: NetworkLinkName;

    readonly numOccupants: number = 0;

    readonly totalDataBytes: number = 0;

    readonly maxBandwidth: number = 0;

    public pipes: Pipe[] = [];

    public static CREATE(name: NetworkLinkName, uid: string, json: NOCLinkJSON): NetworkLink {
        if (Object.values(NOCLinkName).includes(name as NOCLinkName)) {
            return new NOCLink(name as NOCLinkName, uid, json);
        }
        if (Object.values(DramNOCLinkName).includes(name as DramNOCLinkName)) {
            return new DramNOCLink(name as DramNOCLinkName, uid, json);
        }
        if (Object.values(DramBankLinkName).includes(name as DramBankLinkName)) {
            return new DramBankLink(name as DramBankLinkName, uid, json);
        }

        throw new Error('Invalid network link name');
    }

    // readonly noc: NOC;

    constructor(name: NetworkLinkName, uid: string, json: NOCLinkJSON) {
        this.uid = uid;
        this.numOccupants = json.num_occupants;
        this.totalDataBytes = json.total_data_in_bytes;
        this.maxBandwidth = json.max_link_bw;
        this.name = name;

        this.pipes = Object.entries(json.mapped_pipes).map(
            ([pipeId, bandwidth]) => new Pipe(pipeId, bandwidth, name, this.totalDataBytes),
        );
    }

    public generateInitialState(): LinkState {
        return {
            id: this.uid,
            totalDataBytes: this.totalDataBytes,
            bpc: 0,
            saturation: 0,
            maxBandwidth: this.maxBandwidth,
            type: this.type,
        } as LinkState;
    }
}

export class NOCLink extends NetworkLink {
    // public name: NOCLinkName;

    public readonly type: LinkType = LinkType.NOC;

    public readonly noc: NOC;

    constructor(name: NOCLinkName | DramNOCLinkName, uid: string, json: NOCLinkJSON) {
        super(name, uid, json);
        this.noc = name.includes('noc0') ? NOC.NOC0 : NOC.NOC1;
        // this.name = name;
    }
}

export class DramNOCLink extends NOCLink {
    // eslint-disable-next-line no-useless-constructor
    constructor(name: DramNOCLinkName, uid: string, json: NOCLinkJSON) {
        super(name, uid, json);
    }
}

export class DramBankLink extends NetworkLink {
    public readonly bank: DRAMBank = DRAMBank.NONE;

    public readonly type: LinkType = LinkType.DRAM;

    constructor(name: DramBankLinkName, uid: string, json: NOCLinkJSON) {
        super(name, uid, json);

        if (name.includes('dram0')) {
            this.bank = DRAMBank.BANK0;
        } else {
            this.bank = DRAMBank.BANK1;
        }
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

    public loc: Loc = { x: 0, y: 0 };

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
        this.loc = { x: json.location[0], y: json.location[1] };
        this.uid = `${chipId}-${this.loc.y}-${this.loc.x}`;

        const linkId = `${this.loc.x}-${this.loc.y}`;

        this.links = new Map(
            Object.entries(json.links).map(([link, linkJson], index) => [
                link,
                new NOCLink(link as NOCLinkName, `${linkId}-${index}`, linkJson),
            ]),
        );
    }

    public generateInitialState(): ComputeNodeState {
        return {
            id: this.uid,
            selected: false,
            loc: this.loc,
            opName: this.opName,
            dramChannel: this.dramChannel,
            dramSubchannel: this.dramSubchannel,
        } as ComputeNodeState;
    }

    public getLinksForNode = (): NOCLink[] => {
        return [...this.links.values()].sort((a, b) => {
            const firstKeyOrder = Chip.GET_NOC_ORDER().get(a.name as NOCLinkName) ?? Infinity;
            const secondKeyOrder = Chip.GET_NOC_ORDER().get(b.name as NOCLinkName) ?? Infinity;
            return firstKeyOrder - secondKeyOrder;
        });
    };

    public getInternalLinksForNode = (): NOCLink[] => {
        return [...this.links.values()]
            .filter((link) => {
                return INTERNAL_LINK_NAMES.includes(link.name);
            })
            .sort((a, b) => {
                const firstKeyOrder = Chip.GET_NOC_ORDER().get(a.name as NOCLinkName) ?? Infinity;
                const secondKeyOrder = Chip.GET_NOC_ORDER().get(b.name as NOCLinkName) ?? Infinity;
                return firstKeyOrder - secondKeyOrder;
            });
    };

    public getPipeIdsForNode = (): string[] => {
        const pipes: string[] = [];

        this.links.forEach((link) => {
            pipes.push(...link.pipes.map((pipe) => pipe.id));
        });

        return pipes;
    };

    getInternalPipeIDsForNode = (): string[] => {
        return [...this.links.values()]
            .filter((link) => {
                return NOC_LINK_NAMES.includes(link.name as NOCLinkName);
            })
            .map((link) => {
                return [...link.pipes.map((pipe) => pipe.id)];
            })
            .flat();
    };

    public getPipesForDirection(direction: NOCLinkName): string[] {
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

    location: Loc = { x: 0, y: 0 };

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

    const denominationIndex = Math.floor(Math.log(bytes) / Math.log(1024));
    const fractionDigits = denominationIndex > 1 ? 2 : numAfterComma; // MB and up always requires decimals
    return `${(bytes / 1024 ** denominationIndex).toFixed(fractionDigits)} ${sizes[denominationIndex]}`;
};


export const recalculateLinkSaturation = (link: LinkState, totalOpCycles: number) => {
    link.bpc = link.totalDataBytes / totalOpCycles;
    link.saturation = (link.bpc / link.maxBandwidth) * 100;
};
