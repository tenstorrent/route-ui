export interface NodeJson {
    location: number[];
    type: string;
    id: string;
    noc: string;
    op_name: string;
    op_cycles: number;
    dram_channel?: number;
    dram_subchannel?: number;
    links: {[key: string]: NOCLinkJson};
}

export interface SVGJson {
    slowest_op_cycles: number;
    bw_limited_op_cycles: number;
    arch: string;
    nodes: NodeJson[];
    dram_channels: DramChannelJson[];
}

export interface NOCLinkJson {
    num_occupants: number;
    total_data_in_bytes: number;
    max_link_bw: number;
    mapped_pipes: {[key: string]: number};
}

export interface DramChannelJson {
    channel_id: number;
    subchannels: [{[key: string]: NOCLinkJson}];
    dram_inout: NOCLinkJson | null;
    dram0_inout: NOCLinkJson | null;
    dram1_inout: NOCLinkJson | null;
}


