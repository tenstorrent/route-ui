// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent AI ULC

import { app, BrowserWindow, shell, ipcMain, nativeImage } from 'electron';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import os from 'node:os';
import { listenToEventFromWindow } from './utils/bridge';
import ElectronEvents from './ElectronEvents';
import packageJson from '../../package.json';
import MenuBuilder from './menu';


const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js    > Electron-Main
// │ └─┬ preload
// │   └── index.mjs   > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer
//
process.env.APP_ROOT = path.join(__dirname, '../..');

export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron');
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist');
export const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST;

const isDebug = process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

const installExtensions = () => {
    const { installExtension, REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS } = require('electron-extension-installer');
    return installExtension([REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS], {
        loadExtensionOptions: {
            allowFileAccess: true,
        },
    });
};

// Disable GPU Acceleration for Windows 7
if (os.release().startsWith('6.1')) app.disableHardwareAcceleration();

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName());

if (!app.requestSingleInstanceLock()) {
    app.quit();
    process.exit(0);
}

let mainWindow: BrowserWindow | null = null;
const preload = path.join(__dirname, '../preload/index.mjs');
const indexHtml = path.join(RENDERER_DIST, 'index.html');

async function createWindow() {
    if (isDebug) {
        await installExtensions();
    }

    mainWindow = new BrowserWindow({
        title: packageJson.displayName,
        show: false,
        width: 1800,
        height: 1000,
        icon: path.join(process.env.VITE_PUBLIC, 'favicon.ico'),
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            preload,
        },
    });

    if (VITE_DEV_SERVER_URL) {
        // #298
        mainWindow.loadURL(VITE_DEV_SERVER_URL);
        // Open devTool if the app is not packaged
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(indexHtml);
    }

    const icon = nativeImage.createFromPath(path.join(process.env.VITE_PUBLIC, 'icon.png'));

    if (app.dock) {
        app.dock.setIcon(icon);
        app.dock.setBadge('Route');
    }

    mainWindow.on('ready-to-show', () => {
        if (!mainWindow) {
            throw new Error('"mainWindow" is not defined');
        }
        if (process.env.START_MINIMIZED) {
            mainWindow.minimize();
        } else {
            mainWindow.show();
        }
        mainWindow.setTitle(`${packageJson.displayName} (v${app.getVersion()})`);

        listenToEventFromWindow(ElectronEvents.UPDATE_WINDOW_TITLE, (newTitle) => {
            const baseAppTitle = `${packageJson.displayName} (v${app.getVersion()})`;

            if (newTitle) {
                mainWindow?.setTitle(`${baseAppTitle} — ${newTitle}`);
            } else {
                mainWindow?.setTitle(baseAppTitle);
            }
        });
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    const menuBuilder = new MenuBuilder(mainWindow);

    menuBuilder.buildMenu();

    // Test actively push message to the Electron-Renderer
    mainWindow.webContents.on('did-finish-load', () => {
        mainWindow?.webContents.send('main-process-message', new Date().toLocaleString());
    });

    // Make all links open with the browser, not with the application
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        if (url.startsWith('https:')) {
            (async () => {
                await shell.openExternal(url);
            })();
        }
        return { action: 'deny' };
    });

    mainWindow.show();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    mainWindow = null;
    if (process.platform !== 'darwin') app.quit();
});

app.on('second-instance', () => {
    if (mainWindow) {
        // Focus on the main window if the user tried to open another
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.focus();
    }
});

app.on('activate', () => {
    const allWindows = BrowserWindow.getAllWindows();

    if (allWindows.length) {
        allWindows[0]?.focus();
    } else {
        createWindow();
    }
});

// New window example arg: new windows url
ipcMain.handle('open-win', (_, arg) => {
    const childWindow = new BrowserWindow({
        webPreferences: {
            preload,
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    if (VITE_DEV_SERVER_URL) {
        childWindow.loadURL(`${VITE_DEV_SERVER_URL}#${arg}`);
    } else {
        childWindow.loadFile(indexHtml, { hash: arg });
    }
});
