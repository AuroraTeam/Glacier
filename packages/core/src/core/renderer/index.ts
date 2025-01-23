import { tmpdir } from 'os';

import { Window } from '@glacier-app/webview';

import { WindowConfig } from '../../api/windowConfig';

// import defaultHtml from './default.html';

export function init() {
    process.on('message', ipcMessageParser);
}

export interface IPCMessage {
    type: string;
    payload?: any;
}

// Temp
function getTempDir() {
    return tmpdir() + '/glacier';
}

let webviewWindow = new Window(getTempDir());

function ipcMessageParser(message: IPCMessage) {
    switch (message.type) {
        case 'init':
            const windowConfig: WindowConfig = message.payload;

            webviewWindow.setTitle(windowConfig.title);
            // webviewWindow.setSize(windowConfig.width, windowConfig.height);
            // webviewWindow.setHtml(defaultHtml);
            break;

        case 'loadUrl':
            webviewWindow.setUrl(message.payload);
            break;

        case 'show':
            webviewWindow.create();
            break;

        default:
            console.error('Unknown message type: ', message.type);
            break;
    }
}

// webviewWindow.bind('__call_backend', () => {
//     if (!parentPort) return;

//     let message = receiveMessageOnPort(parentPort);
//     if (!message) return;

//     processMessage(message.message);
// });

// const { node, v8, glacier } = process.versions;

// webviewWindow.init(
//     `setInterval(() => __call_backend(), 4);const __versions = {node:"${node}", v8:"${v8}", glacier:"${glacier}"};`,
// );

// if (windowConfig.width && windowConfig.height) {
//     webviewWindow.size(windowConfig.width, windowConfig.height);
// }

// if (windowConfig.title) {
//     webviewWindow.title(windowConfig.title);
// }

// webviewWindow.html(defaultHtml);
// webviewWindow.show();

// function processMessage(message: any) {
//     if (message.type === 'setHtml') {
//         webviewWindow.html(message.html);
//     }

//     if (message.type === 'loadUrl') {
//         webviewWindow.navigate(message.url);
//     }

//     if (message.type === 'loadFile') {
//         webviewWindow.navigate(message.path);
//     }
// }
