import Chip, {ComputeNode, DramName, LinkName, NOCLink} from './DataStructures';

export const getLinksForNode = (node: ComputeNode): NOCLink[] => {
    const nocLinks: NOCLink[] = [];
    node.links.forEach((link) => {
        nocLinks.push(link);
    });

    return nocLinks.sort((a, b) => {
        const firstKeyOrder = Chip.GET_NOC_ORDER().get(a.name) ?? Infinity;
        const secondKeyOrder = Chip.GET_NOC_ORDER().get(b.name) ?? Infinity;
        return firstKeyOrder - secondKeyOrder;
    });
};
export const getInternalLinksForNode = (node: ComputeNode): NOCLink[] => {
    const nocLinks: NOCLink[] = [];
    const internalIds = [
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
    node.links.forEach((link) => {
        if (internalIds.includes(link.name)) {
            nocLinks.push(link);
        }
    });

    return nocLinks.sort((a, b) => {
        const firstKeyOrder = Chip.GET_NOC_ORDER().get(a.name) ?? Infinity;
        const secondKeyOrder = Chip.GET_NOC_ORDER().get(b.name) ?? Infinity;
        return firstKeyOrder - secondKeyOrder;
    });
};

export const getPipeIdsForNode = (node: ComputeNode): string[] => {
    const pipes: string[] = [];

    node.links.forEach((link) => {
        pipes.push(...link.pipes.map((pipe) => pipe.id));
    });

    return pipes;
};

export const getInternalPipeIDsForNode = (node: ComputeNode | undefined): string[] => {
    const pipes: string[] = [];
    if (!node) return pipes;

    const internalLinks = [LinkName.NOC0_IN, LinkName.NOC0_OUT, LinkName.NOC1_IN, LinkName.NOC1_OUT];
    node.links.forEach((link) => {
        if (internalLinks.includes(link.name)) {
            pipes.push(...link.pipes.map((pipe) => pipe.id));
        }
    });

    return pipes;
};

export const LINK_SATURATION_INITIAIL_VALUE = 75;
