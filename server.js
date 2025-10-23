const http = require('http');
const fs = require('fs');
const path = require('path');
const sseHeaders = {
    'Content-Type': 'text/event-stream', 
    'Cache-Control': 'no-cache', 
    'Connection': 'keep-alive' /*, 
    'Access-Control-Allow-Origin': '*'*/
};
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

function reqReceived(req, res) {
    function ticked() {
        res.write(`data: ${JSON.stringify({ time: new Date().toISOString() })}\n\n`);
    }
    if (req.url == '/events') {
        res.writeHead(200, sseHeaders);
        setInterval(ticked, 1000);
    } else {
        function read(error, content) {
            if (error) {
                res.writeHead(404, {'Content-Type':'text/html' });
                res.end();
            } else {
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(content, 'utf-8');
            }
        }
        let filePath = path.join(__dirname, req.url=='/'?'index.html':req.url);
        const extname = String(path.extname(filePath)).toLowerCase();
        const contentType = mimeTypes[extname] || 'application/octet-stream';
        fs.readFile(filePath, read);
    }
}

const server = http.createServer(reqReceived).listen(8080);