import { Window } from '@glacier-app/webview';

import { version } from '../../package.json';
import { init as mainInit } from './main/index';
import { init as rendererInit } from './renderer/index';

process.versions['glacier'] = version;
process.versions['glacier/webview'] = Window.getLibVersion();
process.versions['webview'] = Window.getWebviewVersion();

if (process.argv.includes('renderer')) {
    rendererInit();
} else {
    mainInit();
}
