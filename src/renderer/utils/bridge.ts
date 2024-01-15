import { ipcRenderer } from 'electron';

import store from '../../data/store/createStore';
import { ElectronEvents } from '../../main/ElectronEvents';

export function updateStateOnEvent<T extends Array<any>>(eventName: ElectronEvents, reducer: (...args: T) => any) {
    ipcRenderer.on(eventName, (_event, ...args) => {
        store.dispatch(reducer(...(args as T)));
    });
}

export function sendEventToMain<T extends Array<any>>(eventName: ElectronEvents, ...args: T) {
    ipcRenderer.send(eventName, ...args);
}
