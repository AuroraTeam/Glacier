import { existsSync, readFileSync, writeFileSync } from 'fs';
import { cp, mkdir, readFile, rm } from 'fs/promises';
import { join, resolve } from 'path';

import esbuild from 'esbuild';
import { NtExecutable, NtExecutableResource } from 'pe-library';
import { Data, Resource } from 'resedit';

// import UPX from 'upx';

async function readJson(path) {
    return JSON.parse(await readFile(path, 'utf8'));
}

export class Bundler {
    static async prepare(dir, options) {
        // Prepare
        const workDir = process.cwd();
        const sourceDir = resolve(workDir, dir);

        if (!existsSync(sourceDir)) {
            console.error(`Error! Directory ${sourceDir} not found`);
            process.exit(0);
        }

        const outputDir = options.output
            ? resolve(workDir, options.output)
            : join(workDir, 'out');

        const outAppDir = join(outputDir, 'app');

        const { name, main, glacier } = await readJson(
            join(workDir, 'package.json'),
        );
        const mainFile = resolve(workDir, main);

        // Action
        await rm(outputDir, { recursive: true, force: true });
        await mkdir(outAppDir, { recursive: true });

        const rendererDir = join(sourceDir, 'renderer');
        if (!existsSync(rendererDir)) {
            console.error(`Error! Directory ${rendererDir} not found`);
            process.exit(0);
        }

        await cp(rendererDir, join(outAppDir, 'renderer'), { recursive: true });

        let loaderSuffix;
        switch (process.platform) {
            case 'win32':
                loaderSuffix = 'win.exe';
                break;
            case 'darwin':
                loaderSuffix = 'macos';
                break;
            case 'linux':
                loaderSuffix = 'linux';
                break;
            default:
                break;
        }

        let appName = glacier?.appName || name || 'app';
        appName = appName.replace(/[^a-zA-Z0-9]/g, '');

        const appDescription = glacier?.appDescription || 'Glacier app';

        const appExt = process.platform === 'win32' ? '.exe' : '';

        const outputExecutable = join(outputDir, `${appName}${appExt}`);
        await cp(
            join(import.meta.dirname, `../loader/loader-${loaderSuffix}`),
            outputExecutable,
        );

        await esbuild.build({
            entryPoints: [mainFile],
            bundle: true,
            platform: 'node',
            format: 'esm',
            outfile: join(outAppDir, 'main.js'),
        });

        this.#setData(
            outputExecutable,
            join(workDir, 'resources/icon.ico'),
            appDescription,
            appName,
        );

        // Error: Permission denied
        // this.#compress(outputExecutable);

        return { outputDir };
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static async pack(dir, options) {
        // const { outputDir } = await Bundler.prepare(dir, options);
        console.log('Reworked');
    }

    // /**
    //  * @param {string} file - executable file
    //  */
    // static #compress(file) {
    //     const upx = UPX(file, { best: true, force: true });
    //     upx.output(file)
    //         .start()
    //         .then(function (stats) {
    //             console.log(stats);
    //         })
    //         .catch(function (err) {
    //             console.log(err);
    //         });
    // }

    /**
     *
     * @param {import('fs').PathOrFileDescriptor} bin - executable file
     * @param {import('fs').PathOrFileDescriptor} icon - icon file
     * @param {string} fileDescription - file description
     * @param {string} productName - product name
     */
    static #setData(bin, icon, fileDescription, productName) {
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
            { FileDescription: fileDescription, ProductName: productName },
        );
        vi.outputToResourceEntries(res.entries);

        // write binary
        res.outputResource(exe);
        const newBinary = exe.generate();
        writeFileSync(bin, Buffer.from(newBinary));
    }
}
