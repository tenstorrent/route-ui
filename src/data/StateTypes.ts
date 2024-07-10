// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent Inc.

import type { RelativeRoutingType } from 'react-router-dom';
import type { GraphVertexType } from './GraphNames';

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

export type NodeUID = string;

export interface ComputeNodeState {
    id: NodeUID;
    opName: string;
    queueNameList: string[];
    dramGroup?: string[];
    selected: boolean;
    chipId: number;
}

export interface OperandSelectionState {
    selected: boolean;
    type: GraphVertexType;
}

export interface NodeSelectionState {
    operands: Record<NodeUID, OperandSelectionState>;
    nodeList: Record<NodeUID, ComputeNodeState>[];
    selectedNodeList: NodeUID[][];
    dramNodesHighlight: Record<NodeUID, boolean>[];
    focusNode: string | null;
}

export interface NetworkCongestionState {
    linkSaturationTreshold: number;
    linksPerTemporalEpoch: {
        totalOps: number;
        chipTotalOps: number[];
        normalizedTotalOps: number;
        initialNormalizedTotalOps: number;
    }[];
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

export interface LocationState {
    epoch: number;
    chipId?: number;
    previous?: {
        path: string;
    };
    next?: {
        path: string;
    };
}

export interface NavigateOptions {
    replace?: boolean;
    state?: LocationState;
    preventScrollReset?: boolean;
    relative?: RelativeRoutingType;
    unstable_flushSync?: boolean;
    unstable_viewTransition?: boolean;
}
