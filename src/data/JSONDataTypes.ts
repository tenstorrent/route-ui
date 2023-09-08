export interface NodeDataJSON {
    location: number[];
    type: string;
    id: string;
    noc: string;
    op_name: string;
    op_cycles: number;
    dram_channel?: number;
    dram_subchannel?: number;
    links: {[key: string]: NOCLinkJSON};
}

export interface NetlistAnalyzerDataJSON {
    slowest_op_cycles: number;
    bw_limited_op_cycles: number;
    arch: string;
    nodes: NodeDataJSON[];
    dram_channels: DramChannelJSON[];
}

export interface NOCLinkJSON {
    num_occupants: number;
    total_data_in_bytes: number;
    max_link_bw: number;
    mapped_pipes: {[key: string]: number};
}

export interface DramChannelJSON {
    channel_id: number;
    subchannels: [{[key: string]: NOCLinkJSON}];
    dram_inout: NOCLinkJSON | null;
    dram0_inout: NOCLinkJSON | null;
    dram1_inout: NOCLinkJSON | null;
}

export interface OperationDataJSON {
    name: string;
    inputs: OperationIOJSON[];
    outputs: OperationIOJSON[];
}

export interface OperationIOJSON {
    name: string;
    type: string;
    pipes: {[key: string]: string[]};
}

export interface OperandDataJSON {
    name: string;
    type: string;
    pipes?: {[key: string]: string[]};
    bw?: number;
}
