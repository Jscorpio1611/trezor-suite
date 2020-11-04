/**
 * Support custom protocols (for example: `bitcoin:`)
 */
import { app } from 'electron';
import { isValidProtocol } from '@lib/protocol';

const init = ({ mainWindow }: Dependencies) => {
    const { logger } = global;

    if (!process.env.PROTOCOLS) {
        logger.warn('custom-protocols', 'No protocols defined');
        return;
    }

    // For some reason, PROTOCOLS is an array of strings but is considered as a string by TS...
    const protocols = (process.env.PROTOCOLS as unknown) as string[];
    protocols.forEach((p: string) => app.setAsDefaultProtocolClient(p));

    const sendProtocolInfo = (protocol: string) => {
        if (isValidProtocol(protocol)) {
            mainWindow.webContents.send('protocol/open', protocol);
        }
    };

    // Initial protocol send (if the app is launched via custom protocol)
    if (process.argv[1]) {
        sendProtocolInfo(process.argv[1]);
    }

    app.on('second-instance', (_, argv) => {
        logger.info('custom-protocols', 'Second instance opened');

        // If a custom protocol is being clicked on while the app is running
        if (argv[1]) {
            sendProtocolInfo(argv[1]);
        }

        if (mainWindow) {
            if (mainWindow.isMinimized()) {
                mainWindow.restore();
            }

            mainWindow.focus();
        }
    });

    // Protocol handler for osx
    app.on('open-url', (event, url) => {
        event.preventDefault();
        sendProtocolInfo(url);
    });
};

export default init;
