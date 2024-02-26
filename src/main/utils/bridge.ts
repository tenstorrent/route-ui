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

export function getSavedState<T>(eventName: ElectronEvents): T | undefined {
    const savedState = localStorage.getItem(eventName);
    return savedState ? JSON.parse(savedState) : undefined;
}
