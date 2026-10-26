// This small Node.js server serves the local HTML, CSS, and JavaScript files.
// The browser's app.js calls the assessment API directly; this server does not fetch orders.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

// __dirname is this project's folder. These types tell the browser how to read each file.
const root = __dirname;
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8' };
// Run this callback whenever a browser requests a local file on port 4173.
http.createServer((req, res) => {
  // Opening / serves index.html; other paths serve files such as /styles.css.
  const pathname = new URL(req.url, 'http://localhost').pathname;
  const file = path.join(root, pathname === '/' ? 'index.html' : pathname);
  // Do not serve a file outside this project folder.
  if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
  // Read the requested file and send its contents to the browser.
  fs.readFile(file, (error, content) => {
    // Return 404 if that file does not exist.
    if (error) { res.writeHead(404).end('Not found'); return; }
    // Send the correct content type so the browser can interpret the file.
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
    res.end(content);
  });
}).listen(4173, () => console.log('Open http://localhost:4173'));
