// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent Inc.

import type { RootState } from '../createStore';

export const getClusterView = (state: RootState) => state.clusterView;
