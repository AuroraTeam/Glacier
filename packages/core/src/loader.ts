// maybe need ASAR integration

import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const [mainDir] = process.argv.slice(2);

if (mainDir) {
    tryLoadPackage(mainDir);
} else {
    tryLoadIndex();
}

async function tryLoadIndex() {
    try {
        await import(
            pathToFileURL(resolve(process.cwd(), 'app', 'index.js')).href
        );
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

    try {
        await access(resolve(process.cwd(), main));
    } catch {
        console.error('Error! Main file not found');
        return;
    }

    await import(pathToFileURL(resolve(process.cwd(), main)).href);
}
