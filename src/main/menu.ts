import { BrowserWindow, Menu, MenuItemConstructorOptions, shell } from 'electron';

import { ElectronEvents } from './ElectronEvents';
import { getSavedState, listenToEventFromWindow, sendEventToWindow } from './utils/bridge';

export default class MenuBuilder {
    mainWindow: BrowserWindow;

    constructor(mainWindow: BrowserWindow) {
        this.mainWindow = mainWindow;
    }

    async buildMenu() {
        if (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true') {
            this.setupDevelopmentEnvironment();
        }

        const template =
            process.platform === 'darwin' ? await this.buildDarwinTemplate() : await this.buildDefaultTemplate();

        const menu = Menu.buildFromTemplate(template);
        Menu.setApplicationMenu(menu);

        listenToEventFromWindow(ElectronEvents.TOGGLE_QUEUES_TABLE, (isChecked) => {
            const menuItem = menu.getMenuItemById('toggleQueuesTable');

            if (menuItem) {
                menuItem.checked = isChecked;
            }
        });

        return menu;
    }

    setupDevelopmentEnvironment() {
        this.mainWindow.webContents.on('context-menu', (_, props) => {
            const { x, y } = props;

            Menu.buildFromTemplate([
                {
                    label: 'Inspect element',
                    click: () => {
                        this.mainWindow.webContents.inspectElement(x, y);
                    },
                },
            ]).popup({ window: this.mainWindow });
        });
    }

    async buildDarwinTemplate() {
        const subMenuViewDev: Array<MenuItemConstructorOptions> = [
            { type: 'separator' },
            { role: 'reload' },
            { role: 'forceReload' },
            { role: 'toggleDevTools' },
        ];

        const darwinTemplateDefault: Array<MenuItemConstructorOptions> = [
            {
                label: 'RouteUI',
                role: 'appMenu',
                submenu: [
                    { role: 'about', label: 'About RouteUI' },
                    { type: 'separator' },
                    { role: 'services' },
                    { type: 'separator' },
                    { role: 'hide', label: 'Hide RouteUI' },
                    { role: 'hideOthers' },
                    { role: 'unhide' },
                    { type: 'separator' },
                    { role: 'quit', label: 'Quit RouteUI' },
                ],
            },
            {
                label: 'Edit',
                role: 'editMenu',
                submenu: [{ role: 'cut' }, { role: 'copy' }, { role: 'paste' }, { role: 'selectAll' }],
            },
            {
                label: 'Debug',
                submenu: [
                    {
                        label: 'Toggle logging',
                        type: 'checkbox',
                        checked: false,
                        accelerator: 'Alt+Command+L',
                        click: (menuItem) => {
                            sendEventToWindow(this.mainWindow, ElectronEvents.TOGGLE_LOG_OUTPUT, menuItem.checked);
                        },
                    },
                    {
                        label: 'Feature Flags',
                        type: 'submenu',
                        submenu: [
                            {
                                label: 'Toggle Queues Table',
                                id: 'toggleQueuesTable',
                                type: 'checkbox',
                                checked:
                                    (
                                        await getSavedState<[boolean]>(
                                            this.mainWindow,
                                            ElectronEvents.TOGGLE_QUEUES_TABLE,
                                        )
                                    )?.[0] ?? false,
                                click: (menuItem) => {
                                    sendEventToWindow(
                                        this.mainWindow,
                                        ElectronEvents.TOGGLE_QUEUES_TABLE,
                                        menuItem.checked,
                                    );
                                },
                            },
                        ],
                    },
                    ...(process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true'
                        ? subMenuViewDev
                        : []),
                ],
            },
            {
                label: 'Window',
                role: 'windowMenu',
                submenu: [
                    { role: 'minimize' },
                    { role: 'zoom' },
                    { type: 'separator' },
                    { role: 'togglefullscreen' },
                    { type: 'separator' },
                    { role: 'front' },
                ],
            },
            {
                label: 'Help',
                role: 'help',
                submenu: [
                    {
                        label: 'Report Issue',
                        click: () => {
                            shell.openExternal(
                                'https://yyz-gitlab.local.tenstorrent.com/tenstorrent/route-ui/-/issues/new',
                            );
                        },
                    },
                ],
            },
        ];

        return darwinTemplateDefault as Array<MenuItemConstructorOptions>;
    }

    async buildDefaultTemplate() {
        const subMenuViewDev: Array<MenuItemConstructorOptions> = [
            { type: 'separator' },
            { role: 'reload' },
            { role: 'forceReload' },
            { role: 'toggleDevTools' },
        ];

        const templateDefault: Array<MenuItemConstructorOptions> = [
            {
                label: '&File',
                submenu: [{ type: 'separator' }, { role: 'close' }, { role: 'quit' }],
            },
            {
                label: 'Debug',
                submenu: [
                    {
                        label: 'Toggle logging',
                        type: 'checkbox',
                        checked: false,
                        accelerator: 'Alt+Ctrl+L',
                        click: (menuItem) => {
                            menuItem.checked = !menuItem.checked;

                            sendEventToWindow(this.mainWindow, ElectronEvents.TOGGLE_LOG_OUTPUT, menuItem.checked);
                        },
                    },
                    {
                        label: 'Feature Flags',
                        type: 'submenu',
                        submenu: [
                            {
                                label: 'Toggle Queues Table',
                                id: 'toggleQueuesTable',
                                type: 'checkbox',
                                checked:
                                    (
                                        await getSavedState<[boolean]>(
                                            this.mainWindow,
                                            ElectronEvents.TOGGLE_QUEUES_TABLE,
                                        )
                                    )?.[0] ?? false,
                                click: (menuItem) => {
                                    sendEventToWindow(
                                        this.mainWindow,
                                        ElectronEvents.TOGGLE_QUEUES_TABLE,
                                        menuItem.checked,
                                    );
                                },
                            },
                        ],
                    },
                    ...(process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true'
                        ? subMenuViewDev
                        : []),
                ],
            },
        ];

        return templateDefault;
    }
}
