const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
    if (req.url == '/events') {
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*'  
        });
        setInterval(() => {
            res.write(`data: ${JSON.stringify({ time: new Date().toISOString() })}\n\n`);
        }, 1000);
        return;
    }
    let filePath = path.join(__dirname, req.url=='/'?'index.html':req.url);
    const extname = String(path.extname(filePath)).toLowerCase();
    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.wav': 'audio/wav',
        '.mp4': 'video/mp4',
        '.woff': 'application/font-woff',
        '.ttf': 'application/font-ttf',
        '.eot': 'application/vnd.ms-fontobject',
        '.otf': 'application/font-otf',
        '.wasm': 'application/wasm'
    };
    const contentType = mimeTypes[extname] || 'application/octet-stream';
    fs.readFile(filePath, (error, content) => {
        if (error) {
            res.writeHead(404, {'Content-Type':'text/html' });
            res.end();
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(8080, () => {
  console.log("Server listening");
});

/*
console.log("This is a console.log test");
console.debug("This is a console.debug test");
const http = require('http');
http.createServer((req, res) => {
    console.debug(`createServer: ${req.url}`);
    if (req.url === '/events') {
        console.log(`createServer: ${req.url}`);
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*'  
        });
        setInterval(() => {
            res.write(`data: ${JSON.stringify({ time: new Date().toISOString() })}\n\n`);
        }, 1000);
    }
}).listen(8080);
console.debug("Server is up");
*/