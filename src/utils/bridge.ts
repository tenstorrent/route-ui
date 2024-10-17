// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent AI ULC

import store from '../data/store/createStore';
import ElectronEvents from '../../electron/main/ElectronEvents';
import type { OpenDialogOptions } from 'electron';

export function updateStateOnEvent<T extends Array<any>>(
    eventName: ElectronEvents,
    reducer: (...args: T) => any,
    saveToLocalStorage = false,
) {
    window.electron.ipcRenderer.on(eventName, (_event, ...args) => {
        if (saveToLocalStorage) {
            localStorage.setItem(eventName, JSON.stringify(args));
        }

        store.dispatch(reducer(...(args as T)));
    });
}

export function sendEventToMain<T extends Array<any>>(eventName: ElectronEvents, ...args: T) {
    window.electron.ipcRenderer.send(eventName, ...args);
}

export async function showFileDialog(options: OpenDialogOptions) {
    sendEventToMain(ElectronEvents.SHOW_OPEN_DIALOG, options);

    return new Promise((resolve: (fileList: string[] | undefined) => void) => {
        window.electron.ipcRenderer.once(ElectronEvents.SHOW_OPEN_DIALOG, ({ filePaths }: { filePaths: string[] | undefined }) => {
            resolve(filePaths);
        });
    });
}
