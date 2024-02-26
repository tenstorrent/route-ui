import { LinkType } from './Types';

export interface ExperimentalFeaturesState {
    showQueuesTable: boolean;
}

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

export interface ComputeNodeLocation {
    x: number;
    y: number;
}

export interface ComputeNodeSiblings {
    left?: ComputeNodeLocation;
    right?: ComputeNodeLocation;
    top?: ComputeNodeLocation;
    bottom?: ComputeNodeLocation;
}

export interface ComputeNodeState extends NodeSelection {
    loc: ComputeNodeLocation;
    opName: string;
    siblings: ComputeNodeSiblings;
    /** @deprecated Keeping only for compatibility with DRAM logic */
    border?: {
        left: boolean;
        right: boolean;
        top: boolean;
        bottom: boolean;
    };
    queueNameList: string[];
    dramChannelId: number | -1;
    dramSubchannelId: number | -1;
}

export interface NodeSelection {
    id: string;
    selected: boolean;
}

export interface NodeSelectionState {
    operations: Record<string, { data: ComputeNodeState[]; selected: boolean }>;
    queues: Record<string, { data: ComputeNodeState[]; selected: boolean }>;
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
    linkSaturationTreshold: number;
    links: Record<string, LinkState>;
    totalOps: number;
    CLKMHz: number;
    DRAMBandwidthGBs: number;
    PCIBandwidthGBs: number;
    showLinkSaturation: boolean;
    showNOC0: boolean;
    showNOC1: boolean;
}

export enum IoType {
    ALL = 'all',
    IN = 'in',
    OUT = 'out',
}

export interface GraphRelationshipState {
    name: string;
    temporalEpoch: number;
    chipId: number;
}
export interface ClusterViewState {
    isOpen: boolean;
}
