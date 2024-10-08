// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent AI ULC

/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import { BrowserWindow, app, nativeImage, shell } from 'electron';
import path from 'path';
// import remoteMain from '@electron/remote/main';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import { listenToEventFromWindow } from './utils/bridge';
import { ElectronEvents } from './ElectronEvents';
import packageJson from '../../package.json';

let mainWindow: BrowserWindow | null = null;

if (process.env.NODE_ENV === 'production') {
    const sourceMapSupport = require('source-map-support');
    sourceMapSupport.install();
}

const isDebug = process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
    require('electron-debug')();
}

const installExtensions = () => {
    const { installExtension, REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS } = require('electron-extension-installer');
    return installExtension([REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS], {
        loadExtensionOptions: {
            allowFileAccess: true,
        },
    });
};

const createWindow = async () => {
    if (isDebug) {
        await installExtensions();
    }

    const RESOURCES_PATH = app.isPackaged
        ? path.join(process.resourcesPath, 'assets')
        : path.join(__dirname, '../../assets');

    const getAssetPath = (...paths: string[]): string => {
        return path.join(RESOURCES_PATH, ...paths);
    };

    const remoteMain = require('@electron/remote/main');
    remoteMain.initialize();

    mainWindow = new BrowserWindow({
        show: false,
        width: 1800,
        height: 1000,
        icon: getAssetPath('icon.png'),
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            // preload: app.isPackaged
            //     ? path.join(__dirname, 'preload.js')
            //     : path.join(__dirname, '../../.erb/dll/preload.js'),
        },
    });

    const icon = nativeImage.createFromPath(path.join(getAssetPath('icon.png')));
    if (app.dock) {
        app.dock.setIcon(icon);
        app.dock.setBadge('Route');
    }

    remoteMain.enable(mainWindow.webContents);

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    mainWindow.loadURL(resolveHtmlPath('index.html'));

    mainWindow.on('ready-to-show', () => {
        if (!mainWindow) {
            throw new Error('"mainWindow" is not defined');
        }
        if (process.env.START_MINIMIZED) {
            mainWindow.minimize();
        } else {
            mainWindow.show();
        }
        mainWindow.setTitle(`${packageJson.build.productName} (v${app.getVersion()})`);

        listenToEventFromWindow(ElectronEvents.UPDATE_WINDOW_TITLE, (newTitle) => {
            const baseAppTitle = `${packageJson.build.productName} (v${app.getVersion()})`;

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

    // Open urls in the user's browser
    mainWindow.webContents.setWindowOpenHandler((edata) => {
        (async () => {
            await shell.openExternal(edata.url);
        })();

        return { action: 'deny' };
    });
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
    // Respect the OSX convention of having the application in memory even
    // after all windows have been closed
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

(async () => {
    try {
        await app.whenReady();
        await createWindow();

        app.on('activate', async () => {
            // On macOS it's common to re-create a window in the app when the
            // dock icon is clicked and there are no other windows open.
            if (mainWindow === null) {
                await createWindow();
            }
        });
    } catch (err) {
        console.error(err);
    }
})();
