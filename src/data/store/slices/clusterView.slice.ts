// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent AI ULC

import { createSlice } from '@reduxjs/toolkit';
import { ClusterViewState } from '../../StateTypes';

const clusterviewInitialState: ClusterViewState = {
    isOpen: false,
};
export const clusterViewSlice = createSlice({
    name: 'clusterView',
    initialState: clusterviewInitialState,
    reducers: {
        openClusterView: (state) => {
            state.isOpen = true;
        },
        closeClusterView: (state) => {
            state.isOpen = false;
        },
    },
});

export const { openClusterView, closeClusterView } = clusterViewSlice.actions;
export const clusterViewReducer = clusterViewSlice.reducer;
