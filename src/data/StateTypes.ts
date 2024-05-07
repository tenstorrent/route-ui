// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent Inc.

import type { GraphVertexType } from './GraphNames';
import { LinkType } from './Types';

export interface ExperimentalFeaturesState {}

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

type TemporalEpoch = string;
type NodeUID = string;

export interface ComputeNodeState {
    id: NodeUID;
    opName: string;
    queueNameList: string[];
    dramGroup?: string[];
    selected: boolean;
}

export interface OperandSelectionState {
    selected: boolean;
    type: GraphVertexType;
    graphName: string;
}

export interface NodeSelectionState {
    operands: Record<NodeUID, OperandSelectionState>;
    nodeList: Record<TemporalEpoch, Record<NodeUID, ComputeNodeState>>;
    selectedNodeList: Record<TemporalEpoch, NodeUID[]>;
    dramNodesHighlight: Record<TemporalEpoch, Record<NodeUID, boolean>>;
    focusNode: string | null;
}

export interface LinkState {
    id: string;
    totalDataBytes: number;
    bpc: number;
    saturation: number;
    maxBandwidth: number;
    type: LinkType;
    normalizedSaturation: number;
}

export interface EpochAndLinkStates {
    linkStates: LinkState[];
    temporalEpoch: number;
}

export interface LinkGraphState {
    links: Record<string, LinkState>;
    totalOps: number;
    temporalEpoch: number;
}

export interface NetworkCongestionState {
    linkSaturationTreshold: number;
    graphs: Record<string, LinkGraphState>;
    epochNormalizedTotalOps: number[];
    epochAdjustedTotalOps: number[];
    CLKMHz: number;
    DRAMBandwidthGBs: number;
    PCIBandwidthGBs: number;
    showLinkSaturation: boolean;
    showNOC0: boolean;
    showNOC1: boolean;
}

export interface GraphRelationship {
    name: string;
    temporalEpoch: number;
    chipId: number;
}

export interface ClusterViewState {
    isOpen: boolean;
}

export type FolderLocationType = 'local' | 'remote';
