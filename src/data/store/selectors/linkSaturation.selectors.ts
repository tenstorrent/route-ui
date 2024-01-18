import { RootState } from '../createStore';

export const getLinkData = (state: RootState, id: string) => state.linkSaturation.links[id];

export const getLinkSaturation = (state: RootState) => state.linkSaturation.linkSaturationTreshold;

export const getShowLinkSaturation = (state: RootState) => state.linkSaturation.showLinkSaturation;

export const getShowNOC0 = (state: RootState) => state.linkSaturation.showNOC0;

export const getShowNOC1 = (state: RootState) => state.linkSaturation.showNOC1;
