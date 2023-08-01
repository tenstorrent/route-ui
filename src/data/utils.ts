import SVGData, {ComputeNode, LinkID, NOCLink} from './DataStructures';

export const getLinksForNode = (node: ComputeNode): NOCLink[] => {
    const nocLinks: NOCLink[] = [];
    node.links.forEach((l) => {
        nocLinks.push(l);
    });

    return nocLinks.sort((a, b) => {
        const firstKeyOrder = SVGData.GET_NOC_ORDER().get(a.id) ?? Infinity;
        const secondKeyOrder = SVGData.GET_NOC_ORDER().get(b.id) ?? Infinity;
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

    const internalLinks = [LinkID.NOC0_IN, LinkID.NOC0_OUT, LinkID.NOC1_IN, LinkID.NOC1_OUT];
    node.links.forEach((link) => {
        if (internalLinks.includes(link.id)) {
            pipes.push(...link.pipes.map((pipe) => pipe.id));
        }
    });

    return pipes;
};
