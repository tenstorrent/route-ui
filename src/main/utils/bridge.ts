// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent Inc.

import { BrowserWindow, ipcMain } from 'electron';

import { ElectronEvents } from '../ElectronEvents';

export function listenToEventFromWindow<T extends Array<any>>(
    eventName: ElectronEvents,
    callback: (...args: T) => any,
) {
    ipcMain.on(eventName, (_event, ...args) => {
        callback(...(args as T));
    });
}

export function sendEventToWindow<T extends Array<any>>(window: BrowserWindow, eventName: ElectronEvents, ...args: T) {
    window.webContents.send(eventName, ...args);
}

export async function getSavedState<T>(window: BrowserWindow, eventName: ElectronEvents): Promise<T | undefined> {
    const savedState = await window.webContents.executeJavaScript(`localStorage.getItem('${eventName}');`, true);

    return savedState ? JSON.parse(savedState) : undefined;
}
