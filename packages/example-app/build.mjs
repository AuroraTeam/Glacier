import * as esbuild from 'esbuild';
import sea from "@liudonghua123/node-sea";

import * as fs from 'fs';
import * as PELibrary from 'pe-library';
import * as ResEdit from 'resedit';

class Build {

    async bundle (script, file) {

        console.log(await esbuild.build({
        entryPoints: [script],
        bundle: true,
        platform: 'node',
        outfile: 'dist/out.js',
        minify: true,
        }))

        await sea(
            'dist/out.js', file
        )
    }

    //compress (file){
    //    //Когда переделаю модуль upx в ESM перенесу суда код
    //}

    setIcon (bin, icon, fileDescription, productName) {
        process.chdir(import.meta.dirname);

        const data = fs.readFileSync(bin);

        const exe = PELibrary.NtExecutable.from(data, {ignoreCert: true});
        const res = PELibrary.NtExecutableResource.from(exe);

        // Set The Windows graphical user interface (GUI) subsystem
        exe.newHeader.optionalHeader.subsystem = 2;

        const iconFile = ResEdit.Data.IconFile.from(
            fs.readFileSync(icon),
        );

        ResEdit.Resource.IconGroupEntry.replaceIconsForResource(
            res.entries,
            1,
            1033,
            iconFile.icons.map((item) => item.data),
        );

        const viList = ResEdit.Resource.VersionInfo.fromEntries(res.entries);
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

        // write to another binary
        res.outputResource(exe);
        const newBinary = exe.generate();
        fs.writeFileSync(bin.split('.exe').join('') + '_modified.exe', Buffer.from(newBinary));

    }
}

const build = new Build;

await build.bundle('index.mjs', 'dist/example.exe');
build.setIcon('dist/example.exe', 'resources/icon.ico', 'Demo project', 'Glacier');