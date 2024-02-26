import { ExperimentalFeaturesState } from 'data/StateTypes';
import { RootState } from '../createStore';

// eslint-disable-next-line import/prefer-default-export
export const getExperimentalFeatures = (featureName: keyof ExperimentalFeaturesState) => (state: RootState) =>
    state.experimentalFeatures[featureName];
