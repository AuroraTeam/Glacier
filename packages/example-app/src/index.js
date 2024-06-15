import { Window } from "@glacier/core";
import { join } from "path";

const window = new Window({
    debug: true,
    title: "Example App",
    width: 800,
    height: 550,
});

window.loadFile(join(import.meta.dirname, "index.html"));
