import { HighlightType } from 'data/StateTypes';
import { RootState } from '../createStore';

export const getDramGroup = (state: RootState, id: number | undefined) =>
    id !== undefined && id > -1 ? state.nodeSelection.dram[id] : null;

export const selectNodeSelectionById = (state: RootState, id: string) => state.nodeSelection.nodeList[id];
export const getCoreHighlight = (state: RootState, id: string) =>
    state.nodeSelection.coreHighlightList[id] || HighlightType.NONE;
export const getGroup = (state: RootState, id: string) => state.nodeSelection.groups[id];
