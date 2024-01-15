import { BrowserWindow } from 'electron';

import { ElectronEvents } from '../../data/Types';

export function sendEventToWindow<T extends Array<any>>(window: BrowserWindow, eventName: ElectronEvents, ...args: T) {
    window.webContents.send(eventName, ...args);
}

export default sendEventToWindow;
