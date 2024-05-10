// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent AI ULC

import { ExperimentalFeaturesState } from 'data/StateTypes';
import { RootState } from '../createStore';

// eslint-disable-next-line import/prefer-default-export
export const getExperimentalFeatures = (featureName: keyof ExperimentalFeaturesState) => (state: RootState) =>
    state.experimentalFeatures[featureName];
