import { ClusterDescriptorJSON, DeviceDescriptorJSON } from './sources/ClusterDescriptor';

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

    connectedChips: Map<string, ClusterChip> = new Map();

    constructor(id: ClusterChipId, coordinates: ClusterCoordinates, mmio = false, eth: string[] = []) {
        this.id = id;
        this.coordinates = coordinates;
        this.mmio = mmio;
        this.eth = eth;
    }
}

export default class Cluster {
    public readonly chips: ClusterChip[] = [];

    constructor(clusterDescriptor: ClusterDescriptorJSON, deviceDescriptorList: DeviceDescriptorJSON[]) {
        const connections = clusterDescriptor.ethernet_connections;
        const mmioChips = clusterDescriptor.chips_with_mmio.map((obj) => {
            return Object.values(obj)[0];
        });

        this.chips = Object.entries(clusterDescriptor.chips).map(([ClusterChipId, coordinates]) => {
            const chipId = parseInt(ClusterChipId, 10);
            return new ClusterChip(
                chipId,
                new ClusterCoordinates(coordinates),
                mmioChips.includes(chipId),
                deviceDescriptorList[chipId].eth.map((coreId) => `${ClusterChipId}-${coreId}`),
            );
        });
        connections.forEach((connection) => {
            const chip1 = this.chips[connection[0].chip];
            const chip2 = this.chips[connection[1].chip];
            if (chip1 && chip2) {
                chip1.connectedChips.set(chip1.eth[connection[0].chan], chip2);
                chip2.connectedChips.set(chip2.eth[connection[1].chan], chip1);
            }
        });
    }
}
