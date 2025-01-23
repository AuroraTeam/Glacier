import { version } from '../../package.json';
import { init as mainInit } from './main/index';
import { init as rendererInit } from './renderer/index';

process.versions['glacier'] = version;

if (process.argv.includes('renderer')) {
    rendererInit();
} else {
    mainInit();
}
