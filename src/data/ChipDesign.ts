import {ARCHITECTURE, ComputeNodeType, Loc} from './DataStructures';

export enum ComputeNodeTypeArch {
    ARC = 'arc',
    DRAM = 'dram',
    ETHERNET = 'eth',
    PCIE = 'pcie',
    ROUTER = 'router_only',
    FUNCTIONAL_WORKERS = 'functional_workers',
}

interface ChipDesignJson {
    arch_name: ComputeNodeTypeArch;
    grid: { x_size: number; y_size: number };
    arc: string[];
    dram: [string[]];
    eth: string[];
    pcie: string[];
    router_only: string[];
    functional_workers: string[];
}

export default class ChipDesign {
    public totalCols: number = 0;

    public totalRows: number = 0;

    public architecture: ARCHITECTURE = ARCHITECTURE.NONE;

    public nodes: ComputeNodeSimple[] = [];

    constructor(json: ChipDesignJson) {
        if (json.arch_name.toLowerCase().includes(ARCHITECTURE.GRAYSKULL)) {
            this.architecture = ARCHITECTURE.GRAYSKULL;
        }
        if (json.arch_name.toLowerCase().includes(ARCHITECTURE.WORMHOLE)) {
            this.architecture = ARCHITECTURE.WORMHOLE;
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
            ...json.dram.flat().map((loc) => {
                return new ComputeNodeSimple(ComputeNodeType.DRAM, loc);
            }),
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
