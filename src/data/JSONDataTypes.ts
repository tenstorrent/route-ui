/**
 * SPDX-License-Identifier: Apache-2.0
 * SPDX-FileCopyrightText: © 2024 Tenstorrent Inc.
 */

import { ComputeNodeTypeArch } from './Types';

export interface GraphnameToEpochToDeviceJSON {
    [key: string]: {
        epoch_id: number;
        target_device: number;
    };
}

export interface NodeDataJSON {
    location: number[];
    type: string;
    id: string;
    noc: string;
    op_name: string;
    op_cycles: number;
    dram_channel?: number;
    dram_subchannel?: number;
    harvested?: boolean;
    links: { [key: string]: NOCLinkJSON };
}

export interface NetlistAnalyzerDataJSON {
    slowest_op_cycles: number;
    bw_limited_op_cycles: number;
    arch: string;
    chip_id: number;
    nodes: NodeDataJSON[];
    dram_channels: DramChannelJSON[];
}

export interface NOCLinkJSON {
    num_occupants: number;
    total_data_in_bytes: number;
    max_link_bw: number;
    mapped_pipes: { [key: string]: number };
}

export interface DramChannelJSON {
    channel_id: number;
    subchannels: [{ [key: string]: NOCLinkJSON }];
    dram_inout: NOCLinkJSON | null;
    dram0_inout: NOCLinkJSON | null;
    dram1_inout: NOCLinkJSON | null;
}

export interface OperationDataJSON {
    name: string;
    inputs: OperandJSON[];
    outputs: OperandJSON[];
}

export interface OperandJSON {
    name: string;
    type: string;
    pipes: { [coreId: string]: string[] };
}

export interface OperandDataJSON {
    name: string;
    type: string;
    pipes?: { [key: string]: string[] };
    bw?: number;
}

export interface ChipDesignJSON {
    arch_name: ComputeNodeTypeArch;
    grid: { x_size: number; y_size: number };
    arc: string[];
    dram: string[][];
    eth: string[];
    pcie: string[];
    router_only: string[];
    functional_workers: string[];

    [unknownKey: string]: unknown;
}

// TODO: Populate this interface with (possible) missing attributes
export interface MetadataJSON {
    arch_name: string;
}
