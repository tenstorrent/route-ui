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

export enum NOCLinkName {
    NONE = 'none',
    NOC0_IN = 'noc0_link_in',
    NOC0_OUT = 'noc0_link_out',
    NOC0_NORTH_IN = 'noc0_in_north',
    NOC0_SOUTH_OUT = 'noc0_out_south',
    NOC0_WEST_IN = 'noc0_in_west',
    NOC0_EAST_OUT = 'noc0_out_east',
    NOC1_IN = 'noc1_link_in',
    NOC1_OUT = 'noc1_link_out',
    NOC1_WEST_OUT = 'noc1_out_west',
    NOC1_EAST_IN = 'noc1_in_east',
    NOC1_SOUTH_IN = 'noc1_in_south',
    NOC1_NORTH_OUT = 'noc1_out_north',
}

export enum Architecture {
    NONE = '',
    GRAYSKULL = 'grayskull',
    WORMHOLE = 'wormhole',
}

export enum DramNOCLinkName {
    NOC0_NOC2AXI = 'noc0_noc2axi',
    NOC1_NOC2AXI = 'noc1_noc2axi',
}

export enum DramBankLinkName {
    DRAM_INOUT = 'dram_inout',
    DRAM0_INOUT = 'dram0_inout',
    DRAM1_INOUT = 'dram1_inout',
}

export enum EthernetLinkName {
    ETH_IN = 'from_ethernet',
    ETH_OUT = 'to_ethernet',
}

export enum LinkType {
    NONE = '',
    NOC = 'noc',
    DRAM = 'dram',
    ETHERNET = 'eth',
    PCIE = 'pcie',
}

export type NetworkLinkName = NOCLinkName | DramNOCLinkName | DramBankLinkName | EthernetLinkName;

export enum ComputeNodeType {
    NONE = '',
    ROUTER = 'router',
    CORE = 'core',
    DRAM = 'dram',
    ETHERNET = 'eth',
    PCIE = 'pcie',
}

export enum NOC {
    ANY = '',
    NOC0 = 'noc0',
    NOC1 = 'noc1',
}

export enum DRAMBank {
    NONE = 'none',
    BANK0 = 'bank0',
    BANK1 = 'bank1',
}
