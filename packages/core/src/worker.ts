import {
    parentPort,
    receiveMessageOnPort,
    workerData,
} from 'node:worker_threads';

import { Webview } from '@glacier/webview';

import defaultHtml from './default.html';
import { WindowConfig } from './windowConfig';

const windowConfig = workerData as WindowConfig;

const webviewWindow = new Webview(windowConfig.debug || false);

webviewWindow.bind('__call_backend', () => {
    if (!parentPort) return;

    let message = receiveMessageOnPort(parentPort);
    if (!message) return;

    processMessage(message.message);
});

const { version } = require('../package.json');

const { node, v8 } = process.versions;

webviewWindow.init(
    `setInterval(() => __call_backend(), 4);const __versions = {node:"${node}", v8:"${v8}", glacier:"${version}"};`,
);

if (windowConfig.width && windowConfig.height) {
    webviewWindow.size(windowConfig.width, windowConfig.height);
}

if (windowConfig.title) {
    webviewWindow.title(windowConfig.title);
}

webviewWindow.html(defaultHtml);
webviewWindow.show();

function processMessage(message: any) {
    if (message.type === 'setHtml') {
        webviewWindow.html(message.html);
    }

    if (message.type === 'loadUrl') {
        webviewWindow.navigate(message.url);
    }

    if (message.type === 'loadFile') {
        webviewWindow.navigate(message.path);
    }
}
