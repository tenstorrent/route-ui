
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
}

export interface SVGJson {
    nodes: Node[];
}

export default class SVGData {
    // eslint-disable-next-line no-use-before-define
    public nodes: ComputeNode[] = [];

    public totalCols: number = 0;

    public totalRows: number = 0;

    constructor(data: SVGJson) {


        const list = data.nodes;
        this.nodes = list.reverse().map((el) => {
            const loc: Loc = { x: el.location[1], y: el.location[0] };
            this.totalCols = Math.max(loc.y, this.totalCols);
            this.totalRows = Math.max(loc.x, this.totalRows);
            // eslint-disable-next-line no-use-before-define
            const computeNode = new ComputeNode(el);
            computeNode.type = el.type;
            computeNode.loc = { x: el.location[0], y: el.location[1] };
            return computeNode;
        });
    }
}

export class ComputeNode {
    public id: string = '';

    public type: string = ''; // ComputeNodeType = ComputeNodeType.NONE;

    public loc: Loc = { x: 0, y: 0 };

    public json;

    constructor(json: Node) {
        this.json = json;
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
        }
        return '';
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
