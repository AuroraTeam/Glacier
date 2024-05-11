import { Buffer } from 'buffer';
import { Worker } from 'node:worker_threads';

import { WindowConfig } from './windowConfig';
import worker from './workerImport';

const _worker = Buffer.from(worker, 'base64').toString('utf-8');

class Window {
    #worker: Worker;

    constructor(windowConfig: WindowConfig) {
        this.#worker = new Worker(_worker, {
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
}

export { Window };