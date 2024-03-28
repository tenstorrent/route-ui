/**
 * SPDX-License-Identifier: Apache-2.0
 * SPDX-FileCopyrightText: © 2024 Tenstorrent Inc.
 */

import { ClusterDescriptorJSON, DeviceDescriptorJSON } from './sources/ClusterDescriptor';
import ChipDesign from './ChipDesign';
import { ChipDesignJSON } from './JSONDataTypes';

type ClusterChipId = number;

/** cluster descriptor format
 * from clusterhack */
export class ClusterCoordinates {
    readonly x: number;

    readonly y: number;

    /** rack */
    readonly r: number;

    /** shelf */
    readonly s: number;

    constructor([x, y, r, s]: [number, number, number, number]) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.s = s;
    }

    get coords(): [number, number, number, number] {
        return [this.x, this.y, this.r, this.s];
    }
}

export class ClusterChip {
    readonly id: ClusterChipId;

    readonly coordinates: ClusterCoordinates;

    readonly mmio: boolean = false;

    readonly eth: string[] = [];

    connectedChipsByEthId: Map<string, ClusterChip> = new Map();

    // TODO: not the ideal way to hold the data and we dont need all of it, consider sampling down
    design: ChipDesign | undefined;

    constructor(id: ClusterChipId, coordinates: ClusterCoordinates, mmio = false, eth: string[] = []) {
        this.id = id;
        this.coordinates = coordinates;
        this.mmio = mmio;
        this.eth = eth;
    }
}

export default class Cluster {
    public readonly chips: ClusterChip[] = [];

    _totalCols = 0;

    _totalRows = 0;

    get totalCols(): number {
        return this._totalCols + 1;
    }

    get totalRows(): number {
        return this._totalRows + 1;
    }

    constructor(clusterDescriptor: ClusterDescriptorJSON, deviceDescriptorList: DeviceDescriptorJSON[]) {
        if (!clusterDescriptor) {
            return;
        }
        if (!deviceDescriptorList || deviceDescriptorList.length === 0) {
            return;
        }
        const connections = clusterDescriptor.ethernet_connections;
        const mmioChips = clusterDescriptor.chips_with_mmio.map((obj) => {
            return Object.values(obj)[0];
        });

        this.chips = Object.entries(clusterDescriptor.chips).map(([ClusterChipId, coordinates]) => {
            const chipId = parseInt(ClusterChipId, 10);
            const coords: ClusterCoordinates = new ClusterCoordinates(coordinates);
            this._totalCols = Math.max(this._totalCols, coords.x);
            this._totalRows = Math.max(this._totalRows, coords.y);
            const chip = new ClusterChip(
                chipId,
                coords,
                mmioChips.includes(chipId),
                deviceDescriptorList[chipId].eth.map((coreId) => `${ClusterChipId}-${coreId}`),
            );
            chip.design = new ChipDesign(deviceDescriptorList[chipId] as ChipDesignJSON, chipId);
            return chip;
        });

        // TODO: we need to retain connection details or module orders as we will need to render connected pairs and it is currently working accidentally
        connections.forEach((connection) => {
            const chip1 = this.chips[connection[0].chip];
            const chip2 = this.chips[connection[1].chip];
            if (chip1 && chip2) {
                chip1.connectedChipsByEthId.set(chip1.eth[connection[0].chan], chip2);
                chip2.connectedChipsByEthId.set(chip2.eth[connection[1].chan], chip1);
            }
        });
    }
}
