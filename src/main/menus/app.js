// Copyright (c) 2015-2016 Yuya Ochiai
// Copyright (c) 2016-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
'use strict';

import {app, ipcMain, Menu, session, shell, webContents} from 'electron';

import {ADD_SERVER, SELECT_NEXT_TAB, SELECT_PREVIOUS_TAB} from 'common/communication';

import * as WindowManager from '../windows/windowManager';

function createTemplate(config) {
    const separatorItem = {
        type: 'separator',
    };

    const isMac = process.platform === 'darwin';
    const appName = app.name;
    const firstMenuName = isMac ? appName : 'File';
    const template = [];

    const settingsLabel = isMac ? 'Preferences...' : 'Settings...';

    let platformAppMenu = [];
    if (isMac) {
        platformAppMenu.push(
            {
                label: 'About ' + appName,
                role: 'about',
            },
        );
        platformAppMenu.push(separatorItem);
    }
    platformAppMenu.push({
        label: settingsLabel,
        accelerator: 'CmdOrCtrl+,',
        click() {
            WindowManager.showSettingsWindow();
        },
    });

    if (config.data.enableServerManagement === true) {
        platformAppMenu.push({
            label: 'Sign in to Another Server',
            click() {
                WindowManager.sendToRenderer(ADD_SERVER);
            },
        });
    }

    if (isMac) {
        platformAppMenu = platformAppMenu.concat([
            separatorItem, {
                role: 'hide',
            }, {
                role: 'hideothers',
            }, {
                role: 'unhide',
            }, separatorItem, {
                role: 'quit',
            }]);
    } else {
        platformAppMenu = platformAppMenu.concat([
            separatorItem, {
                role: 'quit',
                accelerator: 'CmdOrCtrl+Q',
            }]);
    }

    template.push({
        label: '&' + firstMenuName,
        submenu: [
            ...platformAppMenu,
        ],
    });
    template.push({
        label: '&Edit',
        submenu: [{
            role: 'undo',
            accelerator: 'CmdOrCtrl+Z',
        }, {
            role: 'Redo',
            accelerator: 'CmdOrCtrl+SHIFT+Z',
        }, separatorItem, {
            role: 'cut',
            accelerator: 'CmdOrCtrl+X',
        }, {
            role: 'copy',
            accelerator: 'CmdOrCtrl+C',
        }, {
            role: 'paste',
            accelerator: 'CmdOrCtrl+V',
        }, {
            role: 'pasteAndMatchStyle',
            accelerator: 'CmdOrCtrl+SHIFT+V',
        }, {
            role: 'selectall',
            accelerator: 'CmdOrCtrl+A',
        }],
    });

    const viewSubMenu = [{
        label: 'Reload',
        accelerator: 'CmdOrCtrl+R',
        click() {
            WindowManager.reload();
        },
    }, {
        label: 'Clear Cache and Reload',
        accelerator: 'Shift+CmdOrCtrl+R',
        click() {
            session.defaultSession.clearCache();
            WindowManager.reload();
        },
    }, {
        role: 'togglefullscreen',
        accelerator: process.platform === 'darwin' ? 'Ctrl+Cmd+F' : 'F11',
    }, separatorItem, {
        label: 'Actual Size',
        role: 'resetZoom',
        accelerator: 'CmdOrCtrl+0',
    }, {
        role: 'zoomIn',
        accelerator: 'CmdOrCtrl+SHIFT+=',
    }, {
        role: 'zoomOut',
        accelerator: 'CmdOrCtrl+-',
    }, separatorItem, {
        label: 'Developer Tools for Application Wrapper',
        accelerator: (() => {
            if (process.platform === 'darwin') {
                return 'Alt+Command+I';
            }
            return 'Ctrl+Shift+I';
        })(),
        click(item, focusedWindow) {
            if (focusedWindow) {
                // toggledevtools opens it in the last known position, so sometimes it goes below the browserview
                if (focusedWindow.isDevToolsOpened()) {
                    focusedWindow.closeDevTools();
                } else {
                    focusedWindow.openDevTools({mode: 'detach'});
                }
            }
        },
    }, {
        label: 'Developer Tools for Current Server',
        click() {
            WindowManager.openBrowserViewDevTools();
        },
    }];

    if (process.platform !== 'darwin' && process.platform !== 'win32') {
        viewSubMenu.push(separatorItem);
        viewSubMenu.push({
            label: 'Toggle Dark Mode',
            click() {
                config.toggleDarkModeManually();
            },
        });
    }

    template.push({
        label: '&View',
        submenu: viewSubMenu,
    });
    template.push({
        label: '&History',
        submenu: [{
            label: 'Back',
            accelerator: process.platform === 'darwin' ? 'Cmd+[' : 'Alt+Left',
            click: () => {
                const focused = webContents.getFocusedWebContents();
                if (focused.canGoBack()) {
                    focused.goBack();
                }
            },
        }, {
            label: 'Forward',
            accelerator: process.platform === 'darwin' ? 'Cmd+]' : 'Alt+Right',
            click: () => {
                const focused = webContents.getFocusedWebContents();
                if (focused.canGoForward()) {
                    focused.goForward();
                }
            },
        }],
    });

    const teams = config.data.teams || [];
    const windowMenu = {
        label: '&Window',
        submenu: [{
            role: 'minimize',

            // empty string removes shortcut on Windows; null will default by OS
            accelerator: process.platform === 'win32' ? '' : null,
        }, {
            role: 'close',
            accelerator: 'CmdOrCtrl+W',
        }, separatorItem, ...teams.slice(0, 9).sort((teamA, teamB) => teamA.order - teamB.order).map((team, i) => {
            return {
                label: team.name,
                accelerator: `CmdOrCtrl+${i + 1}`,
                click() {
                    WindowManager.switchServer(team.name, true);
                },
            };
        }), separatorItem, {
            label: 'Select Next Server',
            accelerator: 'Ctrl+Tab',
            click() {
                WindowManager.sendToRenderer(SELECT_NEXT_TAB);
            },
            enabled: (teams.length > 1),
        }, {
            label: 'Select Previous Server',
            accelerator: 'Ctrl+Shift+Tab',
            click() {
                WindowManager.sendToRenderer(SELECT_PREVIOUS_TAB);
            },
            enabled: (teams.length > 1),
        }],
    };
    template.push(windowMenu);
    const submenu = [];
    if (config.data.MenuhelpLink) {
        submenu.push({
            label: 'Learn More...',
            click() {
                shell.openExternal(config.data.helpLink);
            },
        });
        submenu.push(separatorItem);
    }
    submenu.push({
    // eslint-disable-next-line no-undef
        label: `Version ${app.getVersion()} commit: ${__HASH_VERSION__}`,
        enabled: false,
    });

    if (config.enableAutoUpdater) {
        submenu.push({
            label: 'Check for Updates...',
            click() {
                ipcMain.emit('check-for-updates', true);
            },
        });
    }

    template.push({label: 'Hel&p', submenu});
    return template;
}

function createMenu(config) {
    return Menu.buildFromTemplate(createTemplate(config));
}

export default {
    createMenu,
};
