import { Window } from '@glacier-app/webview';

import { WindowConfig } from '../../api/windowConfig';

// import defaultHtml from './default.html';

export function init() {
    process.on('message', ipcMessageParser);
}

export interface IPCMessage {
    type: string;
    payload?: unknown;
}

let webviewWindow: Window;

function ipcMessageParser(message: IPCMessage) {
    switch (message.type) {
        case 'init': {
            const windowConfig = <WindowConfig>message.payload;

            webviewWindow = new Window({
                width: windowConfig.width || 800,
                height: windowConfig.height || 600,
                title: windowConfig.title || 'Glacier',
            });
            break;
        }

        case 'loadUrl':
            webviewWindow.loadUrl(<string>message.payload);
            break;

        case 'loadHtml':
            webviewWindow.loadHtml(<string>message.payload);
            break;

        case 'show':
            webviewWindow.create((data: string) => {
                console.log(data);
            });
            break;

        default:
            console.error('Unknown message type: ', message.type);
            break;
    }
}
