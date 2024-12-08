#!/usr/bin/env node

// @ts-check

import { spawnSync } from 'child_process';
import { readFile } from 'fs/promises';
import { join } from 'path';

import { program } from 'commander';

import { Bundler } from './bundler.js';

async function readJson(path) {
    return JSON.parse(await readFile(path, 'utf8'));
}

const { version } = await readJson(
    join(import.meta.dirname, '../package.json'),
);

program.name('glacier').version(version).description('Glacier CLI toolchain');

program
    .command('start')
    .argument('[directory]', 'directory to run', '.')
    .description('Run application')
    .action((dir) => {
        let loaderName;
        switch (process.platform) {
            case 'win32':
                loaderName = 'win.exe';
                break;
            case 'darwin':
                loaderName = 'macos';
                break;
            case 'linux':
                loaderName = 'linux';
                break;
            default:
                break;
        }

        spawnSync(
            join(import.meta.dirname, `../loader/loader-${loaderName}`),
            [dir],
            { stdio: 'inherit' },
        );
    });

program
    .command('pack')
    .argument('[directory]', 'directory to pack', 'dist')
    .option('-o, --output <path>', 'output directory path')
    .description('Prepare a directory for build')
    .action((dir, options) => {
        Bundler.prepare(dir, options);
    });

program
    .command('build')
    .argument('[directory]', 'directory to build', 'dist')
    .option('-o, --output <path>', 'output file path')
    .option('-n, --name <name>', 'output file name')
    .description('Build application executable')
    .action(Bundler.pack);

// Bundler.setData(
//     output,
//     join(workDir, 'resources/icon.ico'),
//     'Example project',
//     'Glacier',
// );

// bundler.compress(output);

program.parse();
