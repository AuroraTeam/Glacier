import { randomUUID } from 'crypto';
import { readFileSync, writeFileSync } from 'fs';
import { unlink } from 'fs/promises';
import { tmpdir } from 'os';

import sea from '@liudonghua123/node-sea';
import { build } from 'esbuild';
import { NtExecutable, NtExecutableResource } from 'pe-library';
import { Data, Resource } from 'resedit';
import UPX from 'upx';

export class Builder {
    /**
     * @param {string} script - script to build
     * @param {string} file - output file
     */
    async bundle(script, file) {
        const tempFile = tmpdir() + `${randomUUID()}.js`;

        await build({
            entryPoints: [script],
            bundle: true,
            platform: 'node',
            outfile: tempFile,
            minify: true,
        });

        await sea(tempFile, file);
        await unlink(tempFile);
    }

    /**
     * @param {string} file - executable file
     */
    compress(file) {
        const upx = new UPX(file, { best: true, force: true });
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
     * @param {fs.PathOrFileDescriptor} bin - executable file
     * @param {fs.PathOrFileDescriptor} icon - icon file
     * @param {string} fileDescription - file description
     * @param {string} productName - product name
     */
    setData(bin, icon, fileDescription, productName) {
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
