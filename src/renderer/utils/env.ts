// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent AI ULC

export const isDebug = () => {
    try {
        return process?.env.NODE_ENV === 'development' || process?.env.DEBUG_PROD === 'true';
    } catch {
        return false;
    }
};
