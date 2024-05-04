const { Webview } = require("../dist/webview");
const {
  Worker,
  isMainThread,
  workerData,
  receiveMessageOnPort,
  parentPort,
} = require("node:worker_threads");

if (isMainThread) {
  const worker = new Worker(__filename, { workerData: { hello: "world" } });
  worker.on("message", (msg) => console.log(msg));
  worker.on("error", (err) => console.error(err));
  worker.on("exit", (code) => console.log("Window closed, code:", code));
  console.log("Log after start");
  setTimeout(() => {
    console.log("Repeat log after start");
    worker.postMessage("Hello from Node.js");
  }, 1000);
} else {
  console.log("Worker data:", workerData);

  const webview_window = new Webview();
  webview_window.title("Glacier Demo");
  webview_window.size(800, 600);
  webview_window.html(`<html>
  <head>
    <style>body{display: flex; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif; margin: 0;}</style>
  </head>
  <body>
    <h1>Hello from Webview</h1>
  </body>
</html>`);
  webview_window.bind("__call_backend", () => {
    let message = receiveMessageOnPort(parentPort);
    if (!message) return;

    ({ message } = message);
    parentPort.postMessage(message);
  });
  webview_window.eval(`setInterval(() => __call_backend(), 4)`);
  webview_window.show();
}
