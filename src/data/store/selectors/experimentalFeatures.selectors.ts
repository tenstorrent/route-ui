// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent AI ULC

import { ExperimentalFeaturesState } from 'data/StateTypes';
import { RootState } from '../createStore';

export const getExperimentalFeature = (featureName: keyof ExperimentalFeaturesState) => (state: RootState) =>
    state.experimentalFeatures[featureName];
