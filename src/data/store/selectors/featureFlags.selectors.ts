import { FeatureFlagsState } from 'data/StateTypes';
import { RootState } from '../createStore';

// eslint-disable-next-line import/prefer-default-export
export const getFeatureFlags = (featureFlag: keyof FeatureFlagsState) => (state: RootState) =>
    state.featureFlags[featureFlag];
