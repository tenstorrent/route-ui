import { RootState } from '../createStore';

export const getHighContrastState = (state: RootState) => state.highContrast.enabled;

export default getHighContrastState;
