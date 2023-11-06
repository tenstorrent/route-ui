import type { OperationName, QueueName, GraphVertexType } from '../GraphTypes';
import type Chip from "../Chip";
import { forEach } from "../../utils/IterableHelpers";

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
}

export interface QueueDescriptorJson {
    [queueName: QueueName]: QueueDetailsJson;
}
