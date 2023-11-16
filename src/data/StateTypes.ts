import { LinkType } from './Types';

export interface HighContrastState {
    enabled: boolean;
}

export interface DetailedViewState {
    isOpen: boolean;
    uid: string | null;
}

export interface PipeSelection {
    id: string;
    selected: boolean;
}

export interface PipeSelectionState {
    pipes: Record<string, PipeSelection>;
    pipeIds: string[];
    focusPipe: string | null;
}

export interface ComputeNodeState extends NodeSelection {
    loc: { x: number; y: number };
    opName: string;
    border: { left: boolean; right: boolean; top: boolean; bottom: boolean };
    dramChannelId: number | -1;
    dramSubchannelId: number | -1;
}

export interface NodeSelection {
    id: string;
    selected: boolean;
}

export interface NodeSelectionState {
    groups: Record<string, { data: ComputeNodeState[]; selected: boolean }>;
    nodeList: Record<string, ComputeNodeState>;
    dram: { data: ComputeNodeState[]; selected: boolean }[];
}

export interface LinkState {
    id: string;
    totalDataBytes: number;
    bpc: number;
    saturation: number;
    maxBandwidth: number;
    type: LinkType;
}

export interface NetworkCongestionState {
    linkSaturation: number;
    showLinkSaturation: boolean;
    showNOC0: boolean;
    showNOC1: boolean;
    links: Record<string, LinkState>;
    totalOps: number;
    CLKMHz: number;
    DRAMBandwidthGBs: number;
    PCIBandwidthGBs: number;
}

export enum IoType {
    ALL = 'all',
    IN = 'in',
    OUT = 'out',
}
