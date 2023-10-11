import {
    ChipDesignJSON,
    DramChannelJSON,
    NetlistAnalyzerDataJSON,
    NOCLinkJSON,
    NodeDataJSON,
    OperandJSON,
    OperationDataJSON,
} from './JSONDataTypes';
import { BuildableOperation, BuildableQueue, CoreOperation, isBuildable, Operand, OpIoType } from './ChipAugmentation';
import ChipDesign from './ChipDesign';
import { ComputeNodeState, LinkStateData, PipeSelection } from './StateTypes';
import {
    Architecture,
    ComputeNodeType,
    DRAMBank,
    DramBankLinkName,
    DramNOCLinkName,
    Loc,
    NetworkLinkName,
    NOC,
    NOCLinkName,
} from './Types';
import { INTERNAL_LINK_NAMES, NOC_LINK_NAMES } from './constants';
import type { Operation, OperationName, Queue, QueueName } from './GraphTypes';
import { OpGraphNodeType } from './GraphTypes';
import { forEach, mapIterable } from '../utils/IterableHelpers';

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

    private nodesById: Map<string, ComputeNode> = new Map();

    public get nodes(): Iterable<ComputeNode> {
        return this.nodesById.values();
    }

    protected set nodes(value: Iterable<ComputeNode>) {
        this.nodesById = new Map(mapIterable(value, (node: ComputeNode) => [node.uid, node]));
    }

    public getNode(nodeUID: string): ComputeNode | undefined {
        return this.nodesById.get(nodeUID);
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

    /**
     * Iterates over all operations.
     */
    public get operations(): Iterable<Operation> {
        return this.operationsByName.values();
    }

    private operationsByName: Map<OperationName, BuildableOperation>;

    public getOperation(name: OperationName) {
        return this.operationsByName.get(name);
    }

    protected addOperation(operation: BuildableOperation) {
        if (!this.getOperation(operation.name)) {
            this.operationsByName.set(operation.name, operation);
        }
    }

    protected queuesByName: Map<QueueName, BuildableQueue>;

    public getQueue(name: QueueName): Queue | undefined {
        return this.queuesByName.get(name);
    }

    public addQueue(queue: BuildableQueue) {
        if (!this.getQueue(queue.name)) {
            this.queuesByName.set(queue.name, queue);
        }
    }

    public get queues(): Iterable<Queue> {
        return this.queuesByName.values();
    }

    private _coreOps: CoreOperation[] = [];

    /**
     * Array of core operation data.
     *
     * @Deprecated
     * Use `ComputeNode` and `Operation` interfaces to access these mappings.
     */
    public get coreOps(): CoreOperation[] {
        return this._coreOps;
    }

    /** @Deprecated
     *
     * Use `ComputeNode` and `Operation` interfaces to set these mappings.
     */
    protected set coreOps(value: CoreOperation[]) {
        this._coreOps = value;
    }

    constructor() {
        this.queuesByName = new Map();
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
                const [node, newOperation] = ComputeNode.fromNetlistJSON(nodeJSON, chip.chipId, (name: OperationName) =>
                    chip.operationsByName.get(name)
                );
                if (newOperation) {
                    console.log('Adding operation: ', newOperation.name);
                    chip.addOperation(newOperation);
                }
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
                operation: Operation,
                coreOps: Record<string, CoreOperation>,
                ioType: OpIoType,
            ) => {
                const operand = new Operand(operandJSON.name, operandJSON.type as OpGraphNodeType);

                Object.entries(operandJSON.pipes).forEach(([coreID, pipes]) => {
                    const core = chip.getNode(coreID);
                    if (core === undefined) {
                        throw new Error(
                            `Core ${coreID} was referenced in operand ${operandJSON.name}, but is not present in loaded chip data.`,
                        );
                    }
                    const pipeList: string[] = pipes.map((pipeId) => pipeId.toString());

                    /* The operand created here is *core-specific*. This creates unnecessary duplicate operands, and doesn't map onto the
                     * actual meaning of "Operand" in the domain context.
                     *
                     * In the domain context, only one operand connects two graph nodes (operations or queues). That operand can be implemented with multiple *pipes*, between multiple pairs of cores.
                     *
                     * To associate groups of an operand's pipes to different core IDs, we can just attach the existing `[coreID, pipes]` mappings to the same operand.
                     */
                    const coreOperand = new Operand(operandJSON.name, operandJSON.type as OpGraphNodeType);

                    // Since we just created a new operand, this `pipeIdsByCore` Map will only ever contain one key-value pair.
                    coreOperand.pipeIdsByCore.set(coreID, pipeList);

                    let coreOp: CoreOperation = coreOps[coreID];
                    if (!coreOp) {
                        coreOp = new CoreOperation(operation.name, [], [], []);
                        coreOp.coreID = coreID;
                        coreOp.loc = { x: parseInt(coreID.split('-')[1], 10), y: parseInt(coreID.split('-')[2], 10) };
                        coreOps[coreID] = coreOp;
                    }
                    if (ioType === OpIoType.INPUTS) {
                        coreOp.inputs.push(coreOperand);
                    } else if (ioType === OpIoType.OUTPUTS) {
                        coreOp.outputs.push(coreOperand);
                    }
                });
                return operand;
            };
            const cores: Record<string, CoreOperation> = {};

            Object.entries(operationsJson).map(([operationName, opJson]) => {
                let operation = augmentedChip.operationsByName.get(operationName);
                if (!operation) {
                    console.error(
                        `Operation ${operationName} was found in the op-to-pipe map, but is not present in existing chip data; no core mapping available.`,
                    );
                    operation = new BuildableOperation(operationName, [], [], []);
                    chip.addOperation(operation);
                }

                const inputs = opJson.inputs.map((input) => {
                    const operand = organizeData(input, operation!, cores, OpIoType.INPUTS);
                    if (operand.type === OpGraphNodeType.QUEUE) {
                        const queue = new BuildableQueue(operand.name, [], []);
                        chip.addQueue(queue);
                    }
                    return operand;
                });
                const outputs = opJson.outputs.map((output) => {
                    const operand = organizeData(output, operation!, cores, OpIoType.OUTPUTS);
                    if (operand.type === OpGraphNodeType.QUEUE) {
                        chip.addQueue(new BuildableQueue(operand.name, [], []));
                    }
                    return operand;
                });

                operation.assignInputs(inputs);
                operation.assignOutputs(outputs);

                return operation;
            });
            augmentedChip.coreOps = Object.values(cores);

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

    // TODO: needs a better name to represent update from perf analyser data
    public static AUGMENT_FROM_CORES_JSON(chip: Chip, json: Record<string, CoreOperation>): Chip {
        if (chip) {
            const augmentedChip = new Chip();
            Object.assign(augmentedChip, chip);

            augmentedChip.coreOps = Object.entries(json).map(([uid, core]) => {
                const coreOp = new CoreOperation(core.name, [], [], []);
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
        forEach(this.nodes, (node) => {
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
        forEach(this.nodes, (node) => {
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
        forEach(this.nodes, (node) => {
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
            this.links.push(
                NetworkLink.CREATE(key as DramNOCLinkName, `${channelId}-${subchannelId}-${key}`, value) as DramNOCLink,
            );
        });
    }
}

export class NetworkLink {
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

    public generateInitialState(): LinkStateData {
        return {
            id: this.uid,
            totalDataBytes: this.totalDataBytes,
            bpc: 0,
            saturation: 0,
            maxBandwidth: this.maxBandwidth,
        } as LinkStateData;
    }
}

export class NOCLink extends NetworkLink {
    // public name: NOCLinkName;

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
    /** Creates a ComputeNode from a Node JSON object in a Netlist Analyzer output file.
     *
     * The constructed object will include a reference to an Operation, if an operation is
     * specified in the JSON file.
     *   - A new operation will be created if `getOperation` does not return a match for the operation name
     *   - The referenced operation will gain a back-reference to the new core
     *   - If a new operation is created, it will be returned as the second value of the returned tuple
     */
    static fromNetlistJSON(        nodeJSON: NodeDataJSON,
        chipId: number,
        getOperation: (name: OperationName) => BuildableOperation | undefined,
    ): [node: ComputeNode, createdOperation?: BuildableOperation] {
        const node = new ComputeNode(`0-${nodeJSON.location[1]}-${nodeJSON.location[0]}`);
        node.opCycles = nodeJSON.op_cycles;
        node.links = new Map();
        node.chipId = chipId;

        node.type = nodeJSON.type as ComputeNodeType;
        if (nodeJSON.dram_channel !== undefined && nodeJSON.dram_channel !== null) {
            node.dramChannel = nodeJSON.dram_channel;
            node.dramSubchannel = nodeJSON.dram_subchannel || 0;
        }
        node.loc = { x: nodeJSON.location[0], y: nodeJSON.location[1] };
        node.uid = `${node.chipId}-${node.loc.y}-${node.loc.x}`;

        const linkId = `${node.loc.x}-${node.loc.y}`;

        node.links = new Map(
            Object.entries(nodeJSON.links).map(([link, linkJson], index) => [
                link,
                new NOCLink(link as NOCLinkName, `${linkId}-${index}`, linkJson),
            ]),
        );

        // Associate with operation
        const opName: OperationName = nodeJSON.op_name;
        if (opName) {
            let operation = getOperation(opName);
            if (operation) {
                operation.assignCore(node);
                node.operation = operation;
            } else {
                operation = new BuildableOperation(opName, [node]);
                node.operation = operation;
                return [node, operation];
            }
        }
        return [node];
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

    public operation?: Operation;

    constructor(uid: string, operation?: Operation) {
        this.uid = uid;
        this.operation = operation;
    }

    /** @Deprecated
     * Superceded by `this.operation.name`
     */
    get opName(): string {
        return this.operation?.name || '';
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

export const updateOPCycles = (link: LinkStateData, totalOpCycles: number) => {
    link.bpc = link.totalDataBytes / totalOpCycles;
    link.saturation = (link.bpc / link.maxBandwidth) * 100;
};
