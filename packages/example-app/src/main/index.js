import { Window } from "@glacier-app/core";
import { getUrl } from "./another.js";

const window = new Window({ title: "Example App" });

// window.loadUrl(getUrl());

const code = `
<html>
    <body>
        <h1>Glacier</h1>
        <p>Hello from Glacier</p>
        <pre>Node.js version: <code id="node"></code></pre>
        <pre>V8 version: <code id="v8"></code></pre>
        <pre>Glacier version: <code id="glacier"></code></pre>
        <pre>Webview version: <code id="webview"></code></pre>
        <pre>Glacier/webview version: <code id="glacier/webview"></code></pre>
        <script>
            setInterval(() => __call_backend(), 4);
            const __versions = {node:"${process.versions.node}", v8:"${process.versions.v8}", glacier:"${process.versions.glacier}", "glacier/webview":"${process.versions["glacier/webview"]}", webview:"${process.versions.webview}"};
            document.getElementById("node").textContent = __versions.node;
            document.getElementById("v8").textContent = __versions.v8;
            document.getElementById("glacier").textContent = __versions.glacier;
            document.getElementById("webview").textContent = __versions.webview;
            document.getElementById("glacier/webview").textContent = __versions["glacier/webview"];
        </script>
    </body>
</html>
`;
window.loadHtml(code);

window.show();

setTimeout(() => {
    console.log("Hello from main");
    window.loadUrl(getUrl()); // Не работает
}, 2000);
