import { BrowserWindow, ipcMain } from 'electron';

import { ElectronEvents } from '../ElectronTypes';

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
