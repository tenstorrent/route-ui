import {ChipDesignJSON} from './JSONDataTypes';
import {Architecture, ComputeNodeType, ComputeNodeTypeArch, Loc} from './Types';

export default class ChipDesign {
    public totalCols: number = 0;

    public totalRows: number = 0;

    public architecture: Architecture = Architecture.NONE;

    public nodes: ComputeNodeSimple[] = [];

    constructor(json: ChipDesignJSON) {
        if (json.arch_name.toLowerCase().includes(Architecture.GRAYSKULL)) {
            this.architecture = Architecture.GRAYSKULL;
        }
        if (json.arch_name.toLowerCase().includes(Architecture.WORMHOLE)) {
            this.architecture = Architecture.WORMHOLE;
        }

        this.totalCols = json.grid.x_size - 1;
        this.totalRows = json.grid.y_size - 1;

        this.nodes.push(
            ...json.arc.map((loc) => {
                return new ComputeNodeSimple(ComputeNodeType.CORE, loc);
            }),
            ...json.functional_workers.map((loc) => {
                return new ComputeNodeSimple(ComputeNodeType.CORE, loc);
            }),
            ...json.dram
                .map((channel, dramChannel) => {
                    return channel.map((loc, dramSubChannel) => {
                        const core = new ComputeNodeSimple(ComputeNodeType.DRAM, loc);
                        core.dramChannel = dramChannel;
                        core.dramSubchannel = dramSubChannel;
                        return core;
                    });
                })
                .flat(),

            ...json.eth.map((loc) => {
                return new ComputeNodeSimple(ComputeNodeType.ETHERNET, loc);
            }),
            ...json.pcie.map((loc) => {
                return new ComputeNodeSimple(ComputeNodeType.PCIE, loc);
            }),
            ...json.router_only.map((loc) => {
                return new ComputeNodeSimple(ComputeNodeType.ROUTER, loc);
            })
        );
        this.nodes = this.nodes.sort((a, b) => {
            if (a.loc.y !== b.loc.y) {
                return a.loc.y - b.loc.y;
            }
            return a.loc.x - b.loc.x;
        });
    }
}

export class ComputeNodeSimple {
    public type: ComputeNodeType;

    public loc: Loc = {x: 0, y: 0};

    public dramChannel: number = -1;

    public dramSubchannel: number = 0;

    constructor(type: ComputeNodeType, location: string) {
        this.type = type;
        this.loc = {x: parseInt(location.split('-')[0], 10), y: parseInt(location.split('-')[1], 10)};
    }
}

export function archToNodeType(key: string): ComputeNodeType {
    switch (key) {
        case ComputeNodeTypeArch.ARC:
        case ComputeNodeTypeArch.FUNCTIONAL_WORKERS:
            return ComputeNodeType.CORE;
        case ComputeNodeTypeArch.DRAM:
            return ComputeNodeType.DRAM;
        case ComputeNodeTypeArch.ETHERNET:
            return ComputeNodeType.ETHERNET;
        case ComputeNodeTypeArch.PCIE:
            return ComputeNodeType.PCIE;
        case ComputeNodeTypeArch.ROUTER:
            return ComputeNodeType.ROUTER;
        default:
            return ComputeNodeType.NONE;
    }
}
