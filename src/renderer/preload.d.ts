// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent Inc.

import { ElectronHandler } from 'main/preload';

declare global {
    // eslint-disable-next-line no-unused-vars
    interface Window {
        electron: ElectronHandler;
    }
}

export {};
