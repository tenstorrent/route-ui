import { RootState } from '../createStore';

export const getDramGroup = (state: RootState, id: number | undefined) =>
    id !== undefined && id > -1 ? state.nodeSelection.dram[id] : null;

export const selectNodeSelectionById = (state: RootState, id: string) => state.nodeSelection.nodeList[id];
export const getOperation = (state: RootState, id: string) => state.nodeSelection.operations[id];
export const getSelectedOperationList = (state: RootState) => state.nodeSelection.operations;

export const getQueue = (state: RootState, id: string) => state.nodeSelection.queues[id];
export const getSelectedQueueList = (state: RootState) => state.nodeSelection.queues;

export const getSelectedNodeList = (state: RootState) => state.nodeSelection.nodeList;

export const getOrderedNodeList = (state: RootState) =>
    state.nodeSelection.nodeListOrder.map((id) => state.nodeSelection.nodeList[id]).toReversed();

export const getFocusNode = (state: RootState) => state.nodeSelection.focusNode;
