const { Webview } = require("../dist/webview");
const {
  receiveMessageOnPort,
  parentPort,
  workerData,
} = require("node:worker_threads");

console.log(workerData);

const webview_window = new Webview(true);
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
