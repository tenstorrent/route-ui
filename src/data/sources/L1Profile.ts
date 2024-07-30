// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent AI ULC

type xCoord = number;
type yCoord = number;

export interface L1BufferJSON {
    'buffer-name': string;
    'consumed-size-bytes': number;
    'percent-consumed': number;
    'reserved-size-bytes': number;
    'start-address': `0x${number}`;
}

export interface WorkerCoreL1ProfileJSON {
    'binary-buffers': L1BufferJSON[];
    'core-attributes': {
        'l1-size-bytes': number;
        'logical-core-x-y': `${number}-${number}`;
        'op-name': string;
        'op-type': string;
        'total-consumed-size-bytes': number;
        'total-reserved-size-bytes': number;
    };
    'data-buffers': L1BufferJSON[];
}

export interface L1ProfileJSON {
    metadata: {
        'arch-name': string;
        'graph-name': string;
        'target-device': number;
        'temporal-epoch': number;
    };
    'worker-cores': {
        [key in `${xCoord}-${yCoord}`]: WorkerCoreL1ProfileJSON;
    };
}
