import { Window } from "@glacier/core";

const window = new Window({
    debug: true,
    title: "Example App",
    width: 800,
    height: 600,
});

window.on("exit", (exitCode) => {
    console.log("exit", exitCode);
});

window.on("error", (err) => {
    console.log("error", err);
});

window.on("message", (msg) => {
    console.log("message", msg);
});

window.setHtml(`<h1>Example App</h1><p>This is an example app.</p>`);
