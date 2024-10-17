// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent AI ULC

// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { IpcRendererEvent, app, contextBridge, ipcRenderer } from 'electron';
import type ElectronEvents from '../main/ElectronEvents';
import path from 'path';
import fs, { type Dirent } from 'fs';
import { mkdir } from 'fs/promises';
import { spawn } from 'child_process';
import { setDefaultResultOrder } from 'dns';

const electronHandler = {
    ipcRenderer: {
        on<T extends Array<unknown>>(channel: ElectronEvents, func: (...args: T) => void) {
            const subscription = (_event: IpcRendererEvent, ...args: T) => func(...args);
            ipcRenderer.on(channel, subscription);

            return () => {
                ipcRenderer.removeListener(channel, subscription);
            };
        },
        once<T extends Array<unknown>>(channel: ElectronEvents, func: (...args: T) => void) {
            ipcRenderer.once(channel, (_event, ...args) => func(...args as T));
        },
        send<T extends Array<unknown>>(channel: ElectronEvents, ...args: T) {
            ipcRenderer.send(channel, ...args);
        }
    },
    app: {
        getPath(pathName: string) {
            // @ts-expect-error
            return app.getPath(pathName);
        }
    },
    path: {
        separator: path.sep,
        join(...args: string[]) {
            return path.join(...args);
        },
        dirname(filePath: string) {
            return path.dirname(filePath);
        },
        basename(filePath: string, suffix?: string) {
            return path.basename(filePath, suffix);
        }
    },
    fs: {
        existsSync(filePath: string) {
            return fs.existsSync(filePath);
        },
        readFile(filePath: string, callback: (err: Error | null, data: string) => void) {
            return fs.readFile(filePath, 'utf-8', callback);
        },
        readdir(dirPath: string, options: { withFileTypes: true }, callback: (err: Error | null, entries: Dirent[]) => void) {
            return fs.readdir(dirPath, options, callback);
        },
        mkdir(dirPath: string, options: { recursive: true }) {
            return mkdir(dirPath, options);
        }
    },
    'child_process': {
        spawn
    },
    dns: {
        setDefaultResultOrder
    }
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;

// --------- Preload scripts loading ---------
function domReady(condition: DocumentReadyState[] = ['complete', 'interactive']) {
    return new Promise((resolve) => {
        if (condition.includes(document.readyState)) {
            resolve(true);
        } else {
            document.addEventListener('readystatechange', () => {
                if (condition.includes(document.readyState)) {
                    resolve(true);
                }
            });
        }
    });
}

const safeDOM = {
    append(parent: HTMLElement, child: HTMLElement) {
        if (!Array.from(parent.children).find((e) => e === child)) {
            return parent.appendChild(child);
        }
    },
    remove(parent: HTMLElement, child: HTMLElement) {
        if (Array.from(parent.children).find((e) => e === child)) {
            return parent.removeChild(child);
        }
    },
};

/**
 * https://tobiasahlin.com/spinkit
 * https://connoratherton.com/loaders
 * https://projects.lukehaas.me/css-loaders
 * https://matejkustec.github.io/SpinThatShit
 */
function useLoading() {
    const className = `loaders-css__square-spin`;
    const styleContent = `
@keyframes square-spin {
  25% { transform: perspective(100px) rotateX(180deg) rotateY(0); }
  50% { transform: perspective(100px) rotateX(180deg) rotateY(180deg); }
  75% { transform: perspective(100px) rotateX(0) rotateY(180deg); }
  100% { transform: perspective(100px) rotateX(0) rotateY(0); }
}
.${className} > div {
  animation-fill-mode: both;
  width: 50px;
  height: 50px;
  background: #fff;
  animation: square-spin 3s 0s cubic-bezier(0.09, 0.57, 0.49, 0.9) infinite;
}
.app-loading-wrap {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #282c34;
  z-index: 9;
}
    `;
    const oStyle = document.createElement('style');
    const oDiv = document.createElement('div');

    oStyle.id = 'app-loading-style';
    oStyle.innerHTML = styleContent;
    oDiv.className = 'app-loading-wrap';
    oDiv.innerHTML = `<div class="${className}"><div></div></div>`;

    return {
        appendLoading() {
            safeDOM.append(document.head, oStyle);
            safeDOM.append(document.body, oDiv);
        },
        removeLoading() {
            safeDOM.remove(document.head, oStyle);
            safeDOM.remove(document.body, oDiv);
        },
    };
}

// ----------------------------------------------------------------------

const { appendLoading, removeLoading } = useLoading();
domReady().then(appendLoading);

window.onmessage = (ev) => {
    ev.data.payload === 'removeLoading' && removeLoading();
};

setTimeout(removeLoading, 4999);
