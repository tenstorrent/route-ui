// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent AI ULC

import { ElectronHandler } from 'main/preload';

declare global {
    interface Window {
        electron: ElectronHandler;
    }
}

export {};
