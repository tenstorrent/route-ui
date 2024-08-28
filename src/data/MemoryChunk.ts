// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent AI ULC

export interface Chunk {
    address: number;
    size: number;
    consumedSize: number;
    percentConsumed: number;
    name?: string;
}

export default class MemoryChunk implements Chunk {
    public address: number;

    public size: number;

    public consumedSize: number;

    public percentConsumed: number;

    public name?: string;

    constructor(address: number, size: number, consumedSize: number, percentConsumed?: number, name?: string) {
        this.address = parseInt(String(address), 10);
        this.size = size;
        this.consumedSize = consumedSize;
        this.percentConsumed = percentConsumed ?? (consumedSize / size) * 100;

        if (name) {
            this.name = name;
        }
    }
}
