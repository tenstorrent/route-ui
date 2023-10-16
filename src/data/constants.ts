import { DramBankLinkName, DramNOCLinkName, NOCLinkName } from './Types';

export const LINK_SATURATION_INITIAIL_PERCENT = 75;

export const DRAM_BANDWIDTH_INITIAL_GBS = 21.5;

export const AICLK_INITIAL_MHZ = 1000;

export const INTERNAL_LINK_NAMES = [
    NOCLinkName.NOC0_IN,
    NOCLinkName.NOC1_IN,
    NOCLinkName.NOC0_OUT,
    NOCLinkName.NOC1_OUT,
    DramNOCLinkName.NOC0_NOC2AXI,
    DramNOCLinkName.NOC1_NOC2AXI,
    DramBankLinkName.DRAM_INOUT,
    DramBankLinkName.DRAM0_INOUT,
    DramBankLinkName.DRAM1_INOUT,
];
export const NOC_LINK_NAMES = [NOCLinkName.NOC0_IN, NOCLinkName.NOC0_OUT, NOCLinkName.NOC1_IN, NOCLinkName.NOC1_OUT];
