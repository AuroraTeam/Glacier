import { ChildProcess, fork } from 'node:child_process';

import { IPCMessage } from '../core/renderer';
import { WindowConfig } from './windowConfig';

class Window {
    #process: ChildProcess;

    constructor(windowConfig: WindowConfig) {
        this.#process = fork(process.argv[1]!, ['renderer']);
        this.#send('init', windowConfig);
    }

    on(event: 'error', listener: (err: Error) => void): this;
    on(event: 'exit', listener: (exitCode: number) => void): this;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    on(event: 'message', listener: (value: any) => void): this;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    on(event: string, listener: (...args: any[]) => void) {
        this.#process.on(event, listener);
        return this;
    }

    loadHtml(html: string) {
        this.#send('loadHtml', html);
    }

    loadUrl(url: string) {
        this.#send('loadUrl', url);
    }

    // loadFile(path: string) {
    //     this.#send('loadFile', path);
    // }

    show() {
        this.#send('show');
    }

    #send(type: IPCMessage['type'], payload?: IPCMessage['payload']) {
        this.#process.send({ type, payload });
    }
}

export { Window };
