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
    focusPipes: Record<string, PipeSelection>;
    focusMode: boolean;
}

export interface ComputeNodeState extends NodeSelection {
    loc: { x: number; y: number };
    opName: string;
    border: { left: boolean; right: boolean; top: boolean; bottom: boolean };
    dramChannel: number | -1;
    dramSubchannel: number | -1;
}

export interface NodeSelection {
    id: string;
    selected: boolean;
}

export enum HighlightType {
    INPUT = 'input',
    OUTPUT = 'output',
    NONE = '',
}

export interface NodeSelectionState {
    groups: Record<string, { data: ComputeNodeState[]; selected: boolean }>;
    ioGroupsIn: Record<string, { op: string; selected: boolean }[]>;
    operandsIn: Record<string, boolean>;
    ioGroupsOut: Record<string, { op: string; selected: boolean }[]>;
    operandsOut: Record<string, boolean>;
    nodeList: Record<string, ComputeNodeState>;
    coreHighlightList: Record<string, HighlightType>;
    filename: string;
    dram: { data: ComputeNodeState[]; selected: boolean }[];
    architecture: string;
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
}
