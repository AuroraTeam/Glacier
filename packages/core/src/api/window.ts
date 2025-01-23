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
    on(event: 'message', listener: (value: any) => void): this;
    on(event: string, listener: (...args: any[]) => void) {
        this.#process.on(event, listener);
        return this;
    }

    // setHtml(html: string) {
    //     this.#process.send({ type: 'setHtml', html });
    // }

    loadUrl(url: string) {
        this.#send('loadUrl', url);
    }

    // loadFile(path: string) {
    //     this.#process.send({ type: 'loadFile', path });
    // }

    show() {
        this.#send('show');
    }

    #send(type: IPCMessage['type'], payload?: IPCMessage['payload']) {
        this.#process.send({ type, payload });
    }
}

export { Window };
