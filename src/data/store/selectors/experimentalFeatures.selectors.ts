// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent Inc.

import { ExperimentalFeaturesState } from 'data/StateTypes';
import { RootState } from '../createStore';

// eslint-disable-next-line import/prefer-default-export
export const getExperimentalFeature = (featureName: keyof ExperimentalFeaturesState) => (state: RootState) =>
    state.experimentalFeatures[featureName];
