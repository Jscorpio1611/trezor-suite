import { app } from 'electron';

const logUI = app.commandLine.hasSwitch('log-ui');

const init = ({ mainWindow }: Dependencies) => {
    const { logger } = global;

    mainWindow.webContents.on('did-fail-load', (_, errorCode, errorDescription, validatedUrl) => {
        logger.error(
            'content',
            `Failure to load ${validatedUrl} (${errorCode} - ${errorDescription})`,
        );
    });

    mainWindow.webContents.on('will-navigate', (_, url) => {
        logger.info('content', `Navigate to ${url}`);
    });

    mainWindow.webContents.on('render-process-gone', (_, { reason }) => {
        logger.error('content', `Render process gone (reason: ${reason}`);
    });

    let unresponsiveStart = 0;
    mainWindow.webContents.on('unresponsive', () => {
        unresponsiveStart = +new Date();
        logger.warn('content', 'Unresponsive');
    });

    mainWindow.webContents.on('responsive', () => {
        if (unresponsiveStart !== 0) {
            logger.warn(
                'content',
                `Responsive again after ${(+new Date() - unresponsiveStart / 1000).toFixed(1)}s`,
            );
            unresponsiveStart = 0;
        }
    });

    mainWindow.webContents.on('devtools-opened', () => {
        logger.info('content', `Dev tools opened`);
    });

    mainWindow.webContents.on('devtools-closed', () => {
        logger.info('content', `Dev tools closed`);
    });

    mainWindow.webContents.on('console-message', (_, level, message, line, sourceId) => {
        if (!logUI) {
            return;
        }

        const msg = `${message} - ${sourceId}:${line}`;
        switch (level) {
            case 0:
                logger.debug('ui-log', msg);
                break;
            case 1:
                // Infos are still very verbose
                logger.debug('ui-log', msg);
                break;
            case 2:
                logger.warn('ui-log', msg);
                break;
            case 3:
                logger.error('ui-log', msg);
                break;
            // no default
        }
    });
};

export default init;
