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
    links: {[key: string]: NOCLinkJson};
    internal_links: {[key: string]: NOCLinkJsonInternal};
}

export interface SVGJson {
    slowest_op_cycles: number;
    bw_limited_op_cycles: number;
    nodes: NodeJson[];
}

export interface NOCLinkJson extends NOCLinkJsonInternal {}

export interface NOCLinkJsonInternal {
    num_occupants: number;
    total_data_in_bytes: number;
    max_link_bw: number;
    mapped_pipes: {[key: string]: number};
}

export default class SVGData {
    // eslint-disable-next-line no-use-before-define
    public nodes: ComputeNode[] = [];

    public totalCols: number = 0;

    public totalRows: number = 0;

    public slowestOpCycles: number = 0;

    public bwLimitedOpCycles: number = 0;

    constructor(data: SVGJson) {
        this.slowestOpCycles = data.slowest_op_cycles;
        this.bwLimitedOpCycles = data.bw_limited_op_cycles;

        const totalOpCycles = Math.min(this.slowestOpCycles, this.bwLimitedOpCycles);

        this.nodes = data.nodes.reverse().map((node, i) => {
            const loc: Loc = {x: node.location[1], y: node.location[0]};
            this.totalCols = Math.max(loc.x, this.totalRows);
            this.totalRows = Math.max(loc.y, this.totalCols);
            return new ComputeNode(node, i, totalOpCycles);
        });
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

    public selected: boolean = false;

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

    public getSelections(direction: LinkDirection | LinkDirectionInternal): string[] {
        const allMatchingLinks = [
            ...Array.from(this.links.values()).filter((link) => link.direction === direction),
            ...Array.from(this.internalLinks.values()).filter((link) => link.inOut === direction),
        ];
        const selectedPipes: string[] = allMatchingLinks
            .map((link) => Array.from(link.pipes.values()).filter((pipe) => pipe.selected))
            .map((pipes) => pipes.map((pipe) => pipe.id))
            .flat();

        return selectedPipes;
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

    public getLinksForDirection(direction: LinkDirection | LinkDirectionInternal): NOCLinkInternal[] {
        const links: NOCLinkInternal[] = [];

        this.links.forEach((link) => {
            if (link.direction === direction) {
                links.push(link);
            }
        });
        this.internalLinks.forEach((link) => {
            if (link.inOut === direction) {
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
        this.pipes = new Map();
        this.pipes = new Map(Object.entries(json.mapped_pipes).map(([pipe, pipeJson]) => [pipe, new Pipe(pipe, pipeJson, id)]));
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

    public selected: boolean = false;

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
