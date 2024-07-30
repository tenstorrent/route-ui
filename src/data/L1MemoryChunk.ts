// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent AI ULC

export type HexNumber = number;
export type DecNumber = number;

// eslint-disable-next-line import/prefer-default-export
export class L1MemoryChunk {
    private _address = 0;

    private _sizeInBytes = 0;

    private _consumedSizeInBytes = 0;

    constructor(address: string | HexNumber | DecNumber, sizeInBytes: number, consumedSizeInBytes?: number) {
        // eslint-disable-next-line radix
        const parsedAddress = Number.parseInt(address.toString());

        if (Number.isNaN(parsedAddress)) {
            throw new RangeError('Invalid address');
        }

        this._address = parsedAddress;
        this._sizeInBytes = sizeInBytes;
        this._consumedSizeInBytes = consumedSizeInBytes ?? 0;
    }

    get address() {
        return this._address;
    }

    get hexAddress() {
        return `0x${this._address.toString(16)}`;
    }

    get decAddress() {
        return this._address.toString(10);
    }

    get size() {
        return this._sizeInBytes;
    }

    get consumedSize() {
        return this._consumedSizeInBytes;
    }

    get consumedPercentage() {
        return (this._sizeInBytes / this._consumedSizeInBytes) * 100;
    }
}
