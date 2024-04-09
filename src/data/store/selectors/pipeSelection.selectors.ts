// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent Inc.

import { RootState } from '../createStore';

export const selectPipeSelectionById = (id: string) => (state: RootState) => state.pipeSelection.pipes[id];

export const getSelectedPipes = (ids: string[]) => (state: RootState) => ids.map((id) => state.pipeSelection.pipes[id]);
export const getFocusPipe = (state: RootState) => state.pipeSelection.focusPipe;

export const getSelectedPipesIds = (state: RootState) =>
    Object.values(state.pipeSelection.pipes)
        .filter((pipe) => pipe.selected)
        .map((pipe) => pipe.id);
