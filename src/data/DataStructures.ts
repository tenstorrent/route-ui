import {NodeData, PipeSelection} from './store';
import {SVGJson, NodeJson, NOCLinkJsonInternal, NOCLinkJson} from './JSONDataTypes';

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

export default class SVGData {
    private static NOC_ORDER: Map<LinkDirection, number>;

    public static GET_NOC_ORDER(): Map<LinkDirection, number> {
        if (!SVGData.NOC_ORDER) {
            SVGData.NOC_ORDER = new Map(
                Object.keys(LinkDirection)
                    .map((key) => LinkDirection[key])
                    .map((noc, index) => [noc, index])
            );
        }

        return SVGData.NOC_ORDER;
    }

    public nodes: ComputeNode[] = [];

    public totalCols: number = 0;

    public totalRows: number = 0;

    public slowestOpCycles: number = 0;

    public bwLimitedOpCycles: number = 0;

    public architecture: string = '';

    private uniquePipeList: Pipe[] = [];

    constructor(data: SVGJson) {
        SVGData.GET_NOC_ORDER();

        this.slowestOpCycles = data.slowest_op_cycles;
        this.bwLimitedOpCycles = data.bw_limited_op_cycles;
        this.architecture = data.arch;

        const totalOpCycles = Math.min(this.slowestOpCycles, this.bwLimitedOpCycles);

        this.nodes = data.nodes
            .map((node, i: number) => {
                const loc: Loc = {x: node.location[1], y: node.location[0]};
                this.totalCols = Math.max(loc.y, this.totalCols);
                this.totalRows = Math.max(loc.x, this.totalRows);
                // console.log(node.dram_channel, node.dram_subchannel);
                return new ComputeNode(node, i, totalOpCycles);
            })
            .sort((a, b) => {
                if (a.loc.y !== b.loc.y) {
                    return a.loc.y - b.loc.y;
                }
                return a.loc.x - b.loc.x;
            });
    }

    getAllNodes(): NodeData[] {
        return this.nodes.map((node) => {
            return {
                id: node.uid,
                selected: false,
                loc: node.loc,
                opName: node.opName,
                dramChannel: node.dramChannel,
                dramSubchannel: node.dramSubchannel,
            } as NodeData;
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

export class ComputeNode {
    public uid: number;

    public id: string = '';

    public type: ComputeNodeType = ComputeNodeType.NONE;

    public loc: Loc = {x: 0, y: 0};

    public opName: string = '';

    public opCycles: number = 0;

    public json;

    public links: Map<any, NOCLink>;

    public totalOpCycles: number = 0;

    public dramChannel: number = -1;

    public dramSubchannel: number = 0;

    constructor(json: NodeJson, uid: number, totalOpCycles: number = 0) {
        this.uid = uid;
        this.json = json;
        this.opName = json.op_name;
        this.opCycles = json.op_cycles;
        this.links = new Map();
        this.totalOpCycles = totalOpCycles;
        this.type = json.type as ComputeNodeType;
        if (json.dram_channel !== undefined && json.dram_channel !== null) {
            this.dramChannel = json.dram_channel;
            this.dramSubchannel = json.dram_subchannel || 0;
        }
        this.loc = {x: json.location[0], y: json.location[1]};

        this.links = new Map(Object.entries(json.links).map(([link, linkJson]) => [link, new NOCLink(link, linkJson, this.totalOpCycles)]));
    }

    public getPipesForDirection(direction: LinkDirection): string[] {
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

export enum LinkDirection {
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

export class NOCLink {
    public numOccupants: number = 0;

    public totalDataBytes: number = 0;

    public maxBandwidth: number = 0;

    public pipes: Pipe[] = []; // Map<string, Pipe>;

    public id: string = '';

    public direction: LinkDirection = LinkDirection.NONE;

    public bpc = 0;

    public linkSaturation = 0;

    public noc: NOC;

    constructor(id: string, json: NOCLinkJson, totalOpCycles: number) {
        this.id = id;
        this.numOccupants = json.num_occupants;
        this.totalDataBytes = json.total_data_in_bytes;
        this.maxBandwidth = json.max_link_bw;
        this.bpc = this.totalDataBytes / totalOpCycles;
        this.linkSaturation = (this.bpc / this.maxBandwidth) * 100;
        this.direction = id as LinkDirection;
        this.noc = id.includes('noc0') ? NOC.NOC0 : NOC.NOC1;

        this.pipes = Object.entries(json.mapped_pipes).map(([pipe, bandwidth]) => new Pipe(pipe, bandwidth, id, this.totalDataBytes));
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
