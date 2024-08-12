// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent AI ULC

export interface Chunk {
    address: number;
    size: number;
}

export default class MemoryChunk implements Chunk {
    public address: number;

    public hexAddress: number;

    public size: number;

    public consumedSize: number;

    constructor(address: number, size: number, consumedSize: number) {
        this.address = parseInt(String(address), 10);
        this.hexAddress = address;
        this.size = size;
        this.consumedSize = consumedSize;
    }
}
