import { Worker } from 'node:worker_threads';

import worker from '../../dist/worker.txt';
import { WindowConfig } from './windowConfig';

class Window {
    #worker: Worker;

    constructor(windowConfig: WindowConfig) {
        this.#worker = new Worker(worker, {
            workerData: windowConfig,
            eval: true,
        });
    }

    on(event: 'error', listener: (err: Error) => void): this;
    on(event: 'exit', listener: (exitCode: number) => void): this;
    on(event: 'message', listener: (value: any) => void): this;
    on(event: string, listener: (...args: any[]) => void) {
        this.#worker.on(event, listener);
        return this;
    }

    setHtml(html: string) {
        this.#worker.postMessage({ type: 'setHtml', html });
    }

    loadUrl(url: string) {
        this.#worker.postMessage({ type: 'loadUrl', url });
    }

    loadFile(path: string) {
        this.#worker.postMessage({ type: 'loadFile', path });
    }
}

export { Window };
