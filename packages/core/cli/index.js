#!/usr/bin/env node

import { readFile } from 'fs/promises';
import { join, resolve } from 'path';

import { program } from 'commander';

import { Builder } from './build.js';

async function readJson(path) {
    return JSON.parse(await readFile(path, 'utf8'));
}

const { version } = await readJson(
    join(import.meta.dirname, '../package.json'),
);

program.version(version).description('Glacier CLI tool');

program
    .command('build')
    .argument('[script]', 'script to build')
    .option('-o, --output <path>', 'output file')
    .description('build executable file')
    .action(async (script, options) => {
        const workDir = process.cwd();

        let indexFile;
        if (script) {
            indexFile = resolve(workDir, script);
        } else {
            const { main } = await readJson(join(workDir, 'package.json'));
            indexFile = join(workDir, main);
        }

        const output = options.output
            ? resolve(workDir, options.output)
            : join(workDir, 'app.exe');

        const builder = new Builder();

        await builder.bundle(indexFile, output);

        builder.setData(
            output,
            join(workDir, 'resources/icon.ico'),
            'Example project',
            'Glacier',
        );

        // builder.compress(output);
    });

program.parse();
