import * as PELibrary from "pe-library";
import * as ResEdit from "resedit";
import * as fs from "fs";

const data = fs.readFileSync("example.exe");

const exe = PELibrary.NtExecutable.from(data);
const res = PELibrary.NtExecutableResource.from(exe);

// Set The Windows graphical user interface (GUI) subsystem
exe.newHeader.optionalHeader.subsystem = 2;

const iconFile = ResEdit.Data.IconFile.from(
  fs.readFileSync("./resources/icon.ico")
);

ResEdit.Resource.IconGroupEntry.replaceIconsForResource(
  res.entries,
  1,
  1033,
  iconFile.icons.map((item) => item.data)
);

const viList = ResEdit.Resource.VersionInfo.fromEntries(res.entries);
const vi = viList[0];
vi.setFileVersion(0, 0, 0, 1);
vi.setStringValues(
  { lang: 1033, codepage: 1200 },
  {
    FileDescription: "Demo project",
    ProductName: "Glacier",
  }
);
vi.outputToResourceEntries(res.entries);

// write to another binary
res.outputResource(exe);
const newBinary = exe.generate();
fs.writeFileSync("example.exe", Buffer.from(newBinary));
