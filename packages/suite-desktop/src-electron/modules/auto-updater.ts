/**
 * Auto Updater feature (notify, download, install)
 */

import { app, ipcMain } from 'electron';
import { autoUpdater, CancellationToken } from 'electron-updater';
import { b2t } from '@desktop-electron/libs/utils';
import { toHumanReadable } from '@suite-utils/file';
import { isEnabled } from '@suite-utils/features';

// Runtime flags
const enableUpdater = app.commandLine.hasSwitch('enable-updater');
const disableUpdater = app.commandLine.hasSwitch('disable-updater');
const preReleaseFlag = app.commandLine.hasSwitch('pre-release');

const init = ({ mainWindow, store }: Dependencies) => {
    const { logger } = global;

    if (!isEnabled('DESKTOP_AUTO_UPDATER') && !enableUpdater) {
        logger.info('auto-updater', 'Disabled via feature flag');
        return;
    }

    if (isEnabled('DESKTOP_AUTO_UPDATER') && disableUpdater) {
        logger.info('auto-updater', 'Disabled via command line parameter');
        return;
    }

    // If APPIMAGE is not set on Linux, the auto updater can't handle that
    if (process.platform === 'linux' && process.env.APPIMAGE === undefined) {
        logger.warn('auto-updater', 'APPIMAGE is not defined, skipping auto updater');
        return;
    }

    // Enable feature on FE once it's ready
    mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.webContents.send('update/enable');
    });

    let isManualCheck = false;
    let latestVersion = {};
    let updateCancellationToken: CancellationToken;
    const updateSettings = store.getUpdateSettings();

    autoUpdater.autoDownload = false;
    autoUpdater.autoInstallOnAppQuit = true;
    autoUpdater.allowPrerelease = preReleaseFlag;
    autoUpdater.logger = null;

    logger.info('auto-updater', `Is looking for pre-releases? (${b2t(preReleaseFlag)})`);

    if (updateSettings.skipVersion) {
        logger.debug('auto-updater', `Set to skip version ${updateSettings.skipVersion}`);
        mainWindow.webContents.send('update/skip', updateSettings.skipVersion);
    }

    autoUpdater.on('checking-for-update', () => {
        logger.info('auto-updater', 'Checking for update');
        mainWindow.webContents.send('update/checking');
    });

    autoUpdater.on('update-available', ({ version, releaseDate }) => {
        if (updateSettings.skipVersion === version) {
            logger.warn('auto-updater', [
                'Update is available but was skipped:',
                `- Update version: ${version}`,
                `- Skip version: ${updateSettings.skipVersion}`,
            ]);
            return;
        }

        logger.warn('auto-updater', [
            'Update is available:',
            `- Update version: ${version}`,
            `- Release date: ${releaseDate}`,
            `- Manual check: ${b2t(isManualCheck)}`,
        ]);

        latestVersion = { version, releaseDate, isManualCheck };
        mainWindow.webContents.send('update/available', latestVersion);

        // Reset manual check flag
        isManualCheck = false;
    });

    autoUpdater.on('update-not-available', ({ version, releaseDate }) => {
        logger.info('auto-updater', [
            'No new update is available:',
            `- Last version: ${version}`,
            `- Last release date: ${releaseDate}`,
            `- Manual check: ${b2t(isManualCheck)}`,
        ]);

        latestVersion = { version, releaseDate, isManualCheck };
        mainWindow.webContents.send('update/not-available', latestVersion);

        // Reset manual check flag
        isManualCheck = false;
    });

    autoUpdater.on('error', err => {
        logger.error('auto-updater', `An error happened: ${err.toString()}`);
        mainWindow.webContents.send('update/error', err);
    });

    autoUpdater.on('download-progress', progressObj => {
        logger.debug(
            'auto-updater',
            `Downloading ${progressObj.percent}% (${toHumanReadable(
                progressObj.transferred,
            )}/${toHumanReadable(progressObj.total)})`,
        );
        mainWindow.webContents.send('update/downloading', { ...progressObj });
    });

    autoUpdater.on('update-downloaded', ({ version, releaseDate, downloadedFile }) => {
        logger.info('auto-updater', [
            'Update downloaded:',
            `- Last version: ${version}`,
            `- Last release date: ${releaseDate}`,
            `- Downloaded file: ${downloadedFile}`,
        ]);
        mainWindow.webContents.send('update/downloaded', { version, releaseDate, downloadedFile });
    });

    ipcMain.on('update/check', (_, isManual?: boolean) => {
        if (isManual) {
            isManualCheck = true;
        }

        logger.info('auto-updater', `Update checking request (manual: ${b2t(isManualCheck)})`);
        autoUpdater.checkForUpdates();
    });
    ipcMain.on('update/download', () => {
        logger.info('auto-updater', 'Download requested');
        mainWindow.webContents.send('update/downloading', {
            percent: 0,
            bytesPerSecond: 0,
            total: 0,
            transferred: 0,
        });
        updateCancellationToken = new CancellationToken();
        autoUpdater
            .downloadUpdate(updateCancellationToken)
            .then(() => logger.info('auto-updater', 'Update cancelled'))
            .catch(() => null); // Suppress error in console
    });
    ipcMain.on('update/install', () => {
        logger.info('auto-updater', 'Installation request');
        // This will force the closing of the window to quit the app on Mac
        global.quitOnWindowClose = true;
        // https://www.electron.build/auto-update#module_electron-updater.AppUpdater+quitAndInstall
        // appUpdater.quitAndInstall(isSilent, isForceRunAfter)
        // isSilent (windows): Runs the installer in silent mode
        // isForceRunAfter (windows): Run the app after finish even on silent install
        autoUpdater.quitAndInstall(true, true);
    });
    ipcMain.on('update/cancel', () => {
        logger.info('auto-updater', 'Cancel update request');
        mainWindow.webContents.send('update/available', latestVersion);
        updateCancellationToken.cancel();
    });
    ipcMain.on('update/skip', (_, version) => {
        logger.info('auto-updater', `Skip version (${version}) request`);
        mainWindow.webContents.send('update/skip', version);
        updateSettings.skipVersion = version;
        store.setUpdateSettings(updateSettings);
    });
};

export default init;
