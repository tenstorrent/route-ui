/**
 * SPDX-License-Identifier: Apache-2.0
 * SPDX-FileCopyrightText: © 2024 Tenstorrent Inc.
 */

type ChipId = number;
type EthChannel = number;
type CoreId = string;

export interface ClusterDescriptorJSON {
    chips: {
        [key: ChipId]: [number, number, number, number];
    };
    ethernet_connections: EthernetConnections;
    chips_with_mmio: [key: number, ChipId][];
}

type EthernetConnections = [{ chip: ChipId; chan: EthChannel }, { chip: ChipId; chan: EthChannel }][];

export interface DeviceDescriptorJSON {
    eth: CoreId[];
}
