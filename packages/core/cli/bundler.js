// @ts-check

import { existsSync, readFileSync, writeFileSync } from 'fs';
import { cp, mkdir, readFile, rm, writeFile } from 'fs/promises';
import { basename, join, resolve } from 'path';

import { NtExecutable, NtExecutableResource } from 'pe-library';
import { Data, Resource } from 'resedit';
import UPX from 'upx';

async function readJson(path) {
    return JSON.parse(await readFile(path, 'utf8'));
}

export class Bundler {
    static async prepare(dir, options) {
        // Prepare
        const workDir = process.cwd();
        const packDir = resolve(workDir, dir);

        if (!existsSync(packDir)) {
            console.error('Error! Directory not found');
            process.exit(0);
        }

        const output = options.output
            ? resolve(workDir, options.output)
            : join(workDir, 'out');

        const appDir = join(output, 'app');

        const { main } = await readJson(join(workDir, 'package.json'));
        const mainFile = basename(main);

        // Action
        await rm(output, { recursive: true, force: true });
        await mkdir(appDir, { recursive: true });

        // await writeFile(
        //     join(output, 'package.json'),
        //     `{"main":"index.js","pkg":{"assets": "."}}`,
        //     'utf8',
        // );
        await cp(packDir, appDir, { recursive: true });

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

        await cp(
            join(import.meta.dirname, `../loader/loader-${loaderName}`),
            join(output, `app-${loaderName}`),
        );

        const indexFile = join(appDir, 'index.js');
        if (mainFile !== 'index.js') {
            await writeFile(indexFile, `require("./${mainFile}");`, 'utf8');
        }

        return { output };
    }

    static async pack(dir, options) {
        // const { output } = await Bundler.prepare(dir, options);
        console.log('Reworked');
    }

    /**
     * @param {string} file - executable file
     */
    static compress(file) {
        const upx = UPX(file, { best: true, force: true });
        upx.output(file)
            .start()
            .then(function (stats) {
                console.log(stats);
            })
            .catch(function (err) {
                console.log(err);
            });
    }

    /**
     *
     * @param {import('fs').PathOrFileDescriptor} bin - executable file
     * @param {import('fs').PathOrFileDescriptor} icon - icon file
     * @param {string} fileDescription - file description
     * @param {string} productName - product name
     */
    static setData(bin, icon, fileDescription, productName) {
        const data = readFileSync(bin);

        const exe = NtExecutable.from(data, { ignoreCert: true });
        const res = NtExecutableResource.from(exe);

        // Set The Windows graphical user interface (GUI) subsystem
        exe.newHeader.optionalHeader.subsystem = 2;

        const iconFile = Data.IconFile.from(readFileSync(icon));

        Resource.IconGroupEntry.replaceIconsForResource(
            res.entries,
            1,
            1033,
            iconFile.icons.map((item) => item.data),
        );

        const viList = Resource.VersionInfo.fromEntries(res.entries);
        const vi = viList[0];
        vi.setFileVersion(0, 0, 0, 1);
        vi.setStringValues(
            { lang: 1033, codepage: 1200 },
            {
                FileDescription: fileDescription,
                ProductName: productName,
            },
        );
        vi.outputToResourceEntries(res.entries);

        // write binary
        res.outputResource(exe);
        const newBinary = exe.generate();
        writeFileSync(bin, Buffer.from(newBinary));
    }
}
