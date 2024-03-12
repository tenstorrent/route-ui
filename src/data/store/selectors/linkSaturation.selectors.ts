import { RootState } from '../createStore';

export const getLinkData = (state: RootState, graphName: string, id: string) =>
    state.linkSaturation.graphs[graphName].links[id];
export const getAllLinksForGraph = (state: RootState, graphName: string) =>
    state.linkSaturation.graphs[graphName].links;
export const getAllLinks = (state: RootState) => state.linkSaturation.graphs;
export const getTotalOpsForGraph = (state: RootState, graphName: string) =>
    state.linkSaturation.graphs[graphName]?.totalOps || 0;
export const getLinkSaturation = (state: RootState) => state.linkSaturation.linkSaturationTreshold;
export const getShowLinkSaturation = (state: RootState) => state.linkSaturation.showLinkSaturation;
export const getShowNOC0 = (state: RootState) => state.linkSaturation.showNOC0;
export const getShowNOC1 = (state: RootState) => state.linkSaturation.showNOC1;
