// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent AI ULC

import { DramBankLinkName, EthernetLinkName, NOC2AXILinkName, NOCLinkName, PCIeLinkName } from './Types';

export const LINK_SATURATION_INITIAIL_PERCENT = 75;
export const DRAM_BANDWIDTH_INITIAL_GBS = 21.5; // adjustable
export const ETH_BANDWIDTH_INITIAL_GBS = 12.5; // fixed
export const PCIE_BANDWIDTH_INITIAL_GBS = 24; // should be adjustable
export const AICLK_INITIAL_MHZ = 1000;
export const MAX_CONGESTION_VALUE = 120;
export const INITIAL_OPERATION_PERFORMANCE_THRESHOLD = 1;
export const MAX_OPERATION_PERFORMANCE_THRESHOLD = 5; // this is a where everything is red, not an actual limit
export const MAX_MODEL_RATIO_THRESHOLD = 10;
export const MIN_MODEL_RATIO_THRESHOLD = 0;
export const INITIAL_DETAILS_VIEW_HEIGHT = 340;
export const CLUSTER_NODE_GRID_SIZE = 6;
export const INTERNAL_LINK_NAMES = [
    NOCLinkName.NOC0_IN,
    NOCLinkName.NOC1_IN,
    NOCLinkName.NOC0_OUT,
    NOCLinkName.NOC1_OUT,
    NOC2AXILinkName.NOC0_NOC2AXI,
    NOC2AXILinkName.NOC1_NOC2AXI,
    DramBankLinkName.DRAM_INOUT,
    DramBankLinkName.DRAM0_INOUT,
    DramBankLinkName.DRAM1_INOUT,
    EthernetLinkName.ETH_IN,
    EthernetLinkName.ETH_OUT,
    PCIeLinkName.PCIE_INOUT,
];

export const INTERNAL_NOC_LINK_NAMES = [
    NOCLinkName.NOC0_IN,
    NOCLinkName.NOC0_OUT,
    NOCLinkName.NOC1_IN,
    NOCLinkName.NOC1_OUT,
];
