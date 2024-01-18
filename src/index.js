const { Webview } = require("../dist/webview");

const w = new Webview();
w.title("Glacier Demo");
w.size(600, 600);
w.html(`<html>
  <head>
    <style>body{display: flex; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif; margin: 0;}</style>
  </head>
  <body>
    <h1>Hello from Webview</h1>
  </body>
</html>`);
w.show();
