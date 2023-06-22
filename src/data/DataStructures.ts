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

export interface Node {
    location: number[];
    type: string;
    id: string;
    noc: string;
    op_name: string;
    op_cycles: number;
    links: {};
}

export interface SVGJson {
    nodes: Node[];
}

export interface NOCLinkJson {
    num_occupants: number;
    bandwidth: number;
    mapped_pipes: { [key: string]: number };
}

export default class SVGData {
    // eslint-disable-next-line no-use-before-define
    public nodes: ComputeNode[] = [];

    public totalCols: number = 0;

    public totalRows: number = 0;

    constructor(data: SVGJson) {
        const list = data.nodes;
        this.nodes = list.reverse().map((el) => {
            const loc: Loc = {x: el.location[1], y: el.location[0]};
            this.totalCols = Math.max(loc.y, this.totalCols);
            this.totalRows = Math.max(loc.x, this.totalRows);
            // eslint-disable-next-line no-use-before-define
            const computeNode = new ComputeNode(el);
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

    constructor(json: Node) {
        this.json = json;
        this.opName = json.op_name;
        this.opCycles = json.op_cycles;
        this.links = new Map();
        const keys = Object.keys(json.links);
        keys.forEach((link) => {
            this.links.set(link, new NOCLink(link, json.links[link]));
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

export class NOCLink {
    public numOccupants: number = 0;

    public bandwidth: number = 0;

    public pipes: Map<string, Pipe>;

    public loc: Loc = {x: 0, y: 0};

    public id: string = '';

    public selected: boolean = false;

    public direction: LinkDirection = LinkDirection.NONE;

    constructor(id: string, json: NOCLinkJson) {
        this.id = id;
        this.numOccupants = json.num_occupants;
        this.bandwidth = json.bandwidth;
        this.pipes = new Map();
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
            this.pipes.set(
                pipe,
                new Pipe(pipe, json.mapped_pipes[pipe] as number, id)
            );
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
