/**
 * SPDX-License-Identifier: Apache-2.0
 * SPDX-FileCopyrightText: © 2024 Tenstorrent Inc.
 */

import { ipcRenderer } from 'electron';

import store from '../../data/store/createStore';
import { ElectronEvents } from '../../main/ElectronEvents';

export function updateStateOnEvent<T extends Array<any>>(
    eventName: ElectronEvents,
    reducer: (...args: T) => any,
    saveToLocalStorage = false,
) {
    ipcRenderer.on(eventName, (_event, ...args) => {
        if (saveToLocalStorage) {
            localStorage.setItem(eventName, JSON.stringify(args));
        }

        store.dispatch(reducer(...(args as T)));
    });
}

export function sendEventToMain<T extends Array<any>>(eventName: ElectronEvents, ...args: T) {
    ipcRenderer.send(eventName, ...args);
}
