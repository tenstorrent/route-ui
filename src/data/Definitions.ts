export enum ComputeNodeTypeArch {
    ARC = 'arc',
    DRAM = 'dram',
    ETHERNET = 'eth',
    PCIE = 'pcie',
    ROUTER = 'router_only',
    FUNCTIONAL_WORKERS = 'functional_workers',
}

export type Loc = {
    x: number;
    y: number;
};
