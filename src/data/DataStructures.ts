import {LinkStateData, ComputeNodeState, PipeSelection} from './store';
import {DramChannelJSON, NetlistAnalyzerDataJSON, NOCLinkJSON, NodeDataJSON} from './JSONDataTypes';
import {CoreOperationData, OperationData} from './DataOps';

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

    public chipId: number = 0;

    public nodes: ComputeNode[] = [];

    public totalCols: number = 0;

    public totalRows: number = 0;

    public slowestOpCycles: number = 0;

    public bwLimitedOpCycles: number = 0;

    public architecture: ARCHITECTURE = ARCHITECTURE.NONE;

    private uniquePipeList: Pipe[] = [];

    public dramChannels: DramChannel[] = [];

    public totalOpCycles: number = 0;

    // augmented data

    public operations: OperationData[] = [];

    public cores: CoreOperationData[] = [];

    public pipesPerOp: Map<string, string[]> = new Map<string, string[]>();

    public pipesPerCore: Map<string, string[]> = new Map<string, string[]>();

    public pipesPerOperand: Map<string, string[]> = new Map<string, string[]>();

    public coreGroupsPerOperation: Map<string, string[]> = new Map<string, string[]>();

    public coreGroupsPerOperand: Map<string, string[]> = new Map<string, string[]>();

    public operandsByCore: Map<string, string[]> = new Map<string, string[]>();

    public operationsByCore: Map<string, string[]> = new Map<string, string[]>();

    constructor() {
        Chip.GET_NOC_ORDER();
    }

    public loadFromNetlistJSON(data: NetlistAnalyzerDataJSON) {
        this.slowestOpCycles = data.slowest_op_cycles;
        this.bwLimitedOpCycles = data.bw_limited_op_cycles;
        this.chipId = data.chip_id || 0;

        if (data.arch) {
            if (data.arch.includes(ARCHITECTURE.GRAYSKULL)) {
                this.architecture = ARCHITECTURE.GRAYSKULL;
            }
            if (data.arch.includes(ARCHITECTURE.WORMHOLE)) {
                this.architecture = ARCHITECTURE.WORMHOLE;
            }
        }

        this.totalOpCycles = Math.min(this.slowestOpCycles, this.bwLimitedOpCycles);

        this.nodes = data.nodes
            .map((nodeJSON) => {
                const loc: Loc = {x: nodeJSON.location[1], y: nodeJSON.location[0]};
                this.totalCols = Math.max(loc.y, this.totalCols);
                this.totalRows = Math.max(loc.x, this.totalRows);
                const node = new ComputeNode(`${this.chipId}-${nodeJSON.location[1]}-${nodeJSON.location[0]}`);
                node.fromNetlistJSON(nodeJSON, this.chipId);
                return node;
            })
            .sort((a, b) => {
                if (a.loc.y !== b.loc.y) {
                    return a.loc.y - b.loc.y;
                }
                return a.loc.x - b.loc.x;
            });

        if (data.dram_channels) {
            this.dramChannels = data.dram_channels.map((dramChannel) => {
                return new DramChannel(dramChannel.channel_id, dramChannel);
            });
        }
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
                dramChannel.links.forEach((subchannel) => {
                    links.push(subchannel);
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

    constructor(id: number, channelId: number, json: { [key: string]: NOCLinkJSON }) {
        this.subchannelId = id;
        Object.entries(json).forEach(([key, value]) => {
            this.links.push(new DramLink(key as DramName, `${channelId}-${id}-${key}`, value));
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

    public chipId: number = 0;

    public uid: string;

    public type: ComputeNodeType = ComputeNodeType.NONE;

    public loc: Loc = {x: 0, y: 0};

    public opName: string = '';

    public opCycles: number = 0;

    public links: Map<any, NOCLink> = new Map();

    public dramChannel: number = -1;

    public dramSubchannel: number = 0;

    constructor(uid: string) {
        this.uid = uid;
    }

    // this should be static
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
    public coreOperationData: CoreOperationData | null;

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
