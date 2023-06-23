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

export interface NodeJson {
    location: number[];
    type: string;
    id: string;
    noc: string;
    op_name: string;
    op_cycles: number;
    links: { [key: string]: NOCLinkJson };
    internal_links: { [key: string]: NOCLinkJsonInternal };
}

export interface SVGJson {
    slowest_op_cycles: number;
    bw_limited_op_cycles: number;
    nodes: NodeJson[];
}

export interface NOCLinkJson extends NOCLinkJsonInternal {
}

export interface NOCLinkJsonInternal {
    num_occupants: number;
    total_data_in_bytes: number;
    max_link_bw: number;
    mapped_pipes: { [key: string]: number };
}

export default class SVGData {
    // eslint-disable-next-line no-use-before-define
    public nodes: ComputeNode[] = [];

    public totalCols: number = 0;

    public totalRows: number = 0;

    public slowestOpCycles: number = 0;

    public bwLimitedOpCycles: number = 0;

    constructor(data: SVGJson) {
        const list = data.nodes;
        this.slowestOpCycles = data.slowest_op_cycles;
        this.bwLimitedOpCycles = data.bw_limited_op_cycles;

        const totalOpCycles = Math.min(this.slowestOpCycles, this.bwLimitedOpCycles);

        this.nodes = list.reverse().map((el) => {
            const loc: Loc = {x: el.location[1], y: el.location[0]};
            this.totalCols = Math.max(loc.y, this.totalCols);
            this.totalRows = Math.max(loc.x, this.totalRows);
            const computeNode = new ComputeNode(el, totalOpCycles);
            computeNode.type = el.type;
            computeNode.loc = {x: el.location[0], y: el.location[1]};
            return computeNode;
        });
    }
}

export class ComputeNode {
    public id: string = '';

    public type: string = ''; // ComputeNodeType = ComputeNodeType.NONE;

    public loc: Loc = {x: 0, y: 0};

    public opName: string = '';

    public opCycles: number = 0;

    public json;

    public links: Map<any, NOCLink>;

    public internalLinks: Map<any, NOCLinkInternal>;

    public selected: boolean = false;

    public totalOpCycles: number = 0;

    constructor(json: NodeJson, totalOpCycles: number = 0) {
        this.json = json;
        this.opName = json.op_name;
        this.opCycles = json.op_cycles;
        this.links = new Map();
        this.totalOpCycles = totalOpCycles;

        const keys = Object.keys(json.links);
        keys.forEach((l) => {
            this.links.set(l, new NOCLink(l, json.links[l], this.totalOpCycles));
        });

        this.internalLinks = new Map();
        const intKeys = Object.keys(json.internal_links);
        intKeys.forEach((l) => {
            this.internalLinks.set(l, new NOCLinkInternal(l, json.internal_links[l], this.totalOpCycles));
        });
    }

    public getType(): string {
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

    public getLinksForDirection(direction: LinkDirection): NOCLink[] {
        const links: NOCLink[] = [];
        this.links.forEach((link) => {
            if (link.direction === direction) {
                links.push(link);
            }
        });
        return links;
    }
}

export enum LinkDirectionInternal {
    LINK_IN = 'link_in',
    LINK_OUT = 'link_out',
}

export enum LinkDirection {
    NONE = 'none',
    NORTH_IN = 'north_in',
    SOUTH_OUT = 'south_out',
    EAST_IN = 'east_in',
    WEST_OUT = 'west_out',
    WEST_IN = 'west_in',
    EAST_OUT = 'east_out',
    SOUTH_IN = 'south_in',
    NORTH_OUT = 'north_out',
}

export class NOCLinkInternal {
    public selected: boolean = false;

    public numOccupants: number = 0;

    public totalDataBytes: number = 0;

    public maxBandwidth: number = 0;

    public pipes: Map<string, Pipe>;

    public loc: Loc = {x: 0, y: 0};

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
        this.pipes = new Map();
        const keys = Object.keys(json.mapped_pipes);
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
        keys.forEach((pipe) => {
            this.pipes.set(pipe, new Pipe(pipe, json.mapped_pipes[pipe] as number, id));
        });
    }
}

export class NOCLink extends NOCLinkInternal {
    public direction: LinkDirection = LinkDirection.NONE;

    constructor(id: string, json: NOCLinkJson, totalOpCycles: number) {
        super(id, json, totalOpCycles);

        const keys = Object.keys(json.mapped_pipes);
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
        keys.forEach((pipe) => {
            this.pipes.set(pipe, new Pipe(pipe, json.mapped_pipes[pipe] as number, id));
        });
    }
}

export class Pipe {
    id: string = '';

    location: Loc = {x: 0, y: 0};

    bandwidth: number = 0;

    nocId: string = '';

    public selected: boolean = false;

    constructor(id: string, bandwidth: number, nocId: string = '') {
        this.id = id;
        this.nocId = nocId;
        this.bandwidth = bandwidth;
    }
}

export const convertBytes = (bytes: number, numAfterComma = 0) => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    // eslint-disable-next-line no-param-reassign

    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));

    return `${(bytes / 1024 ** i).toFixed(numAfterComma)} ${sizes[i]}`;
};

/*
noc0_in_north:
        num_occupants: 1
        bandwidth: 107520
        mapped_pipes:
          100122500000: 107520
      noc0_out_south:
        num_occupants: 0
        bandwidth: 0
        mapped_pipes:
          {}
      noc0_in_west:
        num_occupants: 1
        bandwidth: 107520
        mapped_pipes:
          100122600000: 107520
      noc0_out_east:
        num_occupants: 3
        bandwidth: 322560
        mapped_pipes:
          100121300000: 107520
          100121200000: 107520
          100121100000: 107520
      noc1_in_south:
        num_occupants: 0
        bandwidth: 0
        mapped_pipes:
          {}
      noc1_out_north:
        num_occupants: 0
        bandwidth: 0
        mapped_pipes:
          {}
      noc1_in_east:
        num_occupants: 1
        bandwidth: 107520
        mapped_pipes:
          100122600000: 107520
      noc1_out_west:
 */
