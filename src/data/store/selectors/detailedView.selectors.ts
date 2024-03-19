/* eslint-disable import/prefer-default-export */

import { RootState } from '../createStore';

export const getDetailedViewOpenState = (state: RootState) => state.detailedView.isOpen;
