import { RootState } from '../createStore';

export const getLinkData = (state: RootState, id: string) => state.linkSaturation.links[id];

export const getLinkSaturation = (state: RootState) => state.linkSaturation.linkSaturationTreshold;

export const getShowLinkSaturation = (state: RootState) => state.linkSaturation.showLinkSaturation;

export const getShowLinkSaturationNOC0 = (state: RootState) => state.linkSaturation.showLinkSaturationNOC0;

export const getShowLinkSaturationNOC1 = (state: RootState) => state.linkSaturation.showLinkSaturationNOC1;

export const getShowEmptyLinks = (state: RootState) => state.linkSaturation.showEmptyLinks;

export const getShowOperationColors = (state: RootState) => state.linkSaturation.showOperationColors;

export const getShowNodeLocation = (state: RootState) => state.linkSaturation.showNodeLocation;

export const getGridZoom = (state: RootState) => state.linkSaturation.gridZoom;

export const getDetailedViewZoom = (state: RootState) => state.linkSaturation.detailedViewZoom;
