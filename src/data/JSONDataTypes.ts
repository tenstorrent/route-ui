export interface NodeJson {
    location: number[];
    type: string;
    id: string;
    noc: string;
    op_name: string;
    op_cycles: number;
    links: {[key: string]: NOCLinkJson};
}

export interface SVGJson {
    slowest_op_cycles: number;
    bw_limited_op_cycles: number;
    nodes: NodeJson[];
}

export interface NOCLinkJson {
    num_occupants: number;
    total_data_in_bytes: number;
    max_link_bw: number;
    mapped_pipes: {[key: string]: number};
}


