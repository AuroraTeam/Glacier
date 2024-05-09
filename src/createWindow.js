const { Worker } = require("node:worker_threads");
const _worker = require("../dist/worker.txt");
const __worker = Buffer.from(_worker, "base64").toString("utf-8");

function createWindow(windowConfig = { events: {} }) {
  const worker = new Worker(__worker, {
    workerData: { hello: "world" },
    eval: true,
  });

  worker.on(
    "message",
    (msg) => windowConfig.events.onMessage && windowConfig.events.onMessage(msg)
  );
  worker.on(
    "error",
    (err) => windowConfig.events.onError && windowConfig.events.onError(err)
  );
  worker.on(
    "exit",
    (code) => windowConfig.events.onExit && windowConfig.events.onExit(code)
  );
}

module.exports = { createWindow };
