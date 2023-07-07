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

export enum NOC {
    IN_NORTH,
    OUT_NORTH,
    IN_SOUTH,
    OUT_SOUTH,
    IN_EAST,
    OUT_EAST,
    IN_WEST,
    OUT_WEST,
}

export type Loc = {
    x: number;
    y: number;
};

export default class SVGData {
    public nodes: ComputeNode[] = [];

    public totalCols: number = 0;

    public totalRows: number = 0;

    public slowestOpCycles: number = 0;

    public bwLimitedOpCycles: number = 0;

    private uniquePipeList: Pipe[] = [];

    constructor(data: SVGJson) {
        this.slowestOpCycles = data.slowest_op_cycles;
        this.bwLimitedOpCycles = data.bw_limited_op_cycles;

        const totalOpCycles = Math.min(this.slowestOpCycles, this.bwLimitedOpCycles);

        this.nodes = data.nodes
            .map((node, i) => {
                const loc: Loc = {x: node.location[1], y: node.location[0]};
                this.totalCols = Math.max(loc.x, this.totalRows);
                this.totalRows = Math.max(loc.y, this.totalCols);
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
            return {id: node.uid, selected: false, loc: node.loc, opName: node.opName} as NodeData;
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
            node.internalLinks.forEach((link) => {
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
            node.internalLinks.forEach((link) => {
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

    public type: string = ''; // ComputeNodeType = ComputeNodeType.NONE;

    public loc: Loc = {x: 0, y: 0};

    public opName: string = '';

    public opCycles: number = 0;

    public json;

    public links: Map<any, NOCLink>;

    public internalLinks: Map<any, NOCLinkInternal>;

    public totalOpCycles: number = 0;

    constructor(json: NodeJson, uid: number, totalOpCycles: number = 0) {
        this.uid = uid;
        this.json = json;
        this.opName = json.op_name;
        this.opCycles = json.op_cycles;
        this.links = new Map();
        this.totalOpCycles = totalOpCycles;
        this.type = json.type;
        this.loc = {x: json.location[0], y: json.location[1]};

        this.links = new Map(Object.entries(json.links).map(([link, linkJson]) => [link, new NOCLink(link, linkJson, this.totalOpCycles)]));
        this.internalLinks = new Map(Object.entries(json.internal_links).map(([link, linkJson]) => [link, new NOCLinkInternal(link, linkJson, this.totalOpCycles)]));
    }

    public getPipesForDirection(direction: LinkDirection | LinkDirectionInternal): string[] {
        return this.links.get(direction)?.pipes.map((pipe) => pipe.id) || this.internalLinks.get(direction)?.pipes.map((pipe) => pipe.id) || [];
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

export enum LinkDirectionInternal {
    LINK_IN = 'link_in',
    LINK_OUT = 'link_out',
}

export enum LinkDirection {
    NONE = 'none',
    NORTH_IN = 'noc0_in_north',
    SOUTH_OUT = 'noc0_out_south',
    WEST_IN = 'noc0_in_west',
    EAST_OUT = 'noc0_out_east',
    WEST_OUT = 'noc1_out_west',
    EAST_IN = 'noc1_in_east',
    SOUTH_IN = 'noc1_in_south',
    NORTH_OUT = 'noc1_out_north',
}

export class NOCLinkInternal {
    public numOccupants: number = 0;

    public totalDataBytes: number = 0;

    public maxBandwidth: number = 0;

    public pipes: Pipe[] = []; // Map<string, Pipe>;

    public id: string = '';

    public inOut: LinkDirectionInternal | null = null;

    public bpc = 0;

    public linkSaturation = 0;

    constructor(id: string, json: NOCLinkJsonInternal, totalOpCycles: number) {
        this.id = id;
        this.numOccupants = json.num_occupants;
        this.totalDataBytes = json.total_data_in_bytes;
        this.maxBandwidth = json.max_link_bw;
        this.bpc = this.totalDataBytes / totalOpCycles;
        this.linkSaturation = this.bpc / this.maxBandwidth;

        switch (id) {
            case 'link_in':
                this.inOut = LinkDirectionInternal.LINK_IN;
                break;
            case 'link_out':
                this.inOut = LinkDirectionInternal.LINK_OUT;
                break;
            default:
                this.inOut = null;
        }

        this.populatePipes(json, id);
    }

    populatePipes(json: NOCLinkJsonInternal, id: string) {
        this.pipes = Object.entries(json.mapped_pipes).map(([pipe, pipeJson]) => new Pipe(pipe, pipeJson, id));
    }
}

export class NOCLink extends NOCLinkInternal {
    public direction: LinkDirection = LinkDirection.NONE;

    constructor(id: string, json: NOCLinkJson, totalOpCycles: number) {
        super(id, json, totalOpCycles);
        switch (id) {
            case 'noc0_in_north':
                this.direction = LinkDirection.NORTH_IN;
                break;
            case 'noc0_out_south':
                this.direction = LinkDirection.SOUTH_OUT;
                break;
            case 'noc1_in_south':
                this.direction = LinkDirection.SOUTH_IN;
                break;
            case 'noc1_out_north':
                this.direction = LinkDirection.NORTH_OUT;
                break;
            case 'noc0_in_west':
                this.direction = LinkDirection.WEST_IN;
                break;
            case 'noc0_out_east':
                this.direction = LinkDirection.EAST_OUT;
                break;
            case 'noc1_in_east':
                this.direction = LinkDirection.EAST_IN;
                break;
            case 'noc1_out_west':
                this.direction = LinkDirection.WEST_OUT;
                break;
            default:
                this.direction = LinkDirection.NONE;
        }
        super.populatePipes(json, id);
    }
}

export class Pipe {
    id: string = '';

    location: Loc = {x: 0, y: 0};

    bandwidth: number = 0;

    nocId: string = '';

    constructor(id: string, bandwidth: number, nocId: string = '') {
        this.id = id;
        this.nocId = nocId;
        this.bandwidth = bandwidth;
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
