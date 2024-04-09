// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent Inc.

import { QueueLocation } from '../Types';
import { QueueName } from '../GraphNames';

interface AllocationInfoJson {
    address: number;
    channel: number;
    subchannel: number;
}

export interface QueueDetailsJson {
    alias: string;
    'allocation-info': AllocationInfoJson[];
    'block-dim': string;
    'data-format': string;
    'device-id': number;
    entries: number;
    'grid-size': [number, number];
    input: string;
    layout: string;
    location: string;
    'source-device-id': number;
    'tile-dim': string;
    type: string;
    processedLocation: QueueLocation;
}

export interface QueueDescriptorJson {
    [queueName: QueueName]: QueueDetailsJson;
}

export const parsedQueueLocation = (locationString: string): QueueLocation => {
    const match = locationString.match(/LOCATION::(\w+)/);
    if (match !== null) {
        switch (match[1]) {
            case 'HOST':
                return QueueLocation.HOST;
            case 'DRAM':
                return QueueLocation.DRAM;
            default:
                return QueueLocation.NONE;
        }
    }
    return QueueLocation.NONE;
};
