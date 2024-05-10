// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent AI ULC

import { createRoot } from 'react-dom/client';

import { updateStateOnEvent } from './utils/bridge';

import { setLogOutputEnabled } from '../data/store/slices/logging.slice';
import { ElectronEvents } from '../main/ElectronEvents';
import App from './App';

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);
root.render(<App />);

updateStateOnEvent(ElectronEvents.TOGGLE_LOG_OUTPUT, setLogOutputEnabled);
