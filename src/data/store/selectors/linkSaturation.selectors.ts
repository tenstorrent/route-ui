import { RootState } from '../createStore';

export const getLinkData = (state: RootState, id: string) => state.linkSaturation.links[id];

export default getLinkData;
