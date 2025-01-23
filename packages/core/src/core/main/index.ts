// maybe need ASAR integration

import { access, readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';

const [mainDir] = process.argv.slice(2);

export function init() {
    if (mainDir) {
        tryLoadPackage(mainDir);
    } else {
        tryLoadIndex();
    }
}

const require = createRequire(process.cwd());

async function tryLoadIndex() {
    try {
        require(resolve(process.cwd(), 'app', 'index.js'));
    } catch {
        console.error('Error! Main file not found');
    }
}

async function tryLoadPackage(mainDir: string) {
    const packageJson = await readFile(
        resolve(process.cwd(), mainDir, 'package.json'),
        'utf8',
    );
    const { main } = JSON.parse(packageJson);

    const mainPath = resolve(process.cwd(), main);

    try {
        await access(mainPath);
    } catch {
        console.error('Error! Main file not found');
        return;
    }

    try {
        require(mainPath);
    } catch (error) {
        console.error('Error loading module:', error);
    }
}
