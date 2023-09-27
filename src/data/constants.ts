import {DramName, LinkName} from './Types';

export const LINK_SATURATION_INITIAIL_VALUE = 75;

export const INTERNAL_LINK_NAMES = [
    LinkName.NOC0_IN,
    LinkName.NOC1_IN,
    LinkName.NOC0_OUT,
    LinkName.NOC1_OUT,
    DramName.NOC0_NOC2AXI,
    DramName.NOC1_NOC2AXI,
    DramName.DRAM_INOUT,
    DramName.DRAM0_INOUT,
    DramName.DRAM1_INOUT,
];
export const NOC_LINK_NAMES = [LinkName.NOC0_IN, LinkName.NOC0_OUT, LinkName.NOC1_IN, LinkName.NOC1_OUT];
