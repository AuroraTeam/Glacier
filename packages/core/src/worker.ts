import {
    parentPort,
    receiveMessageOnPort,
    workerData,
} from 'node:worker_threads';

import { Webview } from '@glacier/webview';

import { WindowConfig } from './windowConfig';

const windowConfig = workerData as WindowConfig;

const webviewWindow = new Webview(windowConfig.debug || false);

webviewWindow.bind('__call_backend', () => {
    if (!parentPort) return;

    let message = receiveMessageOnPort(parentPort);
    if (!message) return;

    processMessage(message.message);
});
webviewWindow.init(`setInterval(() => __call_backend(), 4)`);

if (windowConfig.width && windowConfig.height) {
    webviewWindow.size(windowConfig.width, windowConfig.height);
}

if (windowConfig.title) {
    webviewWindow.title(windowConfig.title);
}

webviewWindow.html('');
webviewWindow.show();

function processMessage(message: any) {
    if (message.type === 'setHtml') {
        webviewWindow.html(message.html);
    }
}
