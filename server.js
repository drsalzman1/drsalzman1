import { createServer } from 'http';
import { readFile } from 'fs';
import { join, extname } from 'path';
import { WebSocketServer } from 'ws';

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
    function read(error, content) {
        if (error) {
            res.writeHead(404, {'Content-Type':'text/html' });
            res.end();
        } else {
            res.writeHead(200, { 'Content-Type': typ });
            res.end(content, 'utf-8');
        }
    }

    let filePath = join(import.meta.dirname, req.url=='/'?'index.html':req.url);
    const ext = String(extname(filePath)).toLowerCase();
    const typ = mimeTypes[ext] || 'application/octet-stream';
    readFile(filePath, read);
}

createServer(reqReceived).listen(8080);
console.log('fileServer listening to port 8080');

let client = 1;

function connected(socket) {
    function messaged(buffer) {
        const msg = buffer.toString();
        if (msg == "ping")
            socket.send("pong");
        else
            console.log(`server rxed '${msg}' (${id})`);
    }

    function closed() {
        console.log(`socket closed (${id})`);
    }

    function erred(error) {
        console.error(`socket error: ${error} (${id})`);
    }

    const id = client++;
    console.log(`socket connected (${id})`);
    socket.send(`You are client ${id}`)
    console.log(`server sent 'You are client ${id}' (${id})`)
    socket.on('message', messaged);
    socket.on('close', closed);
    socket.on('error', erred);
}

function erred(error) {
    console.log(`socketServer error: ${error}`);
}

const socketServer = new WebSocketServer({port:3000});
socketServer.on('connection', connected);
socketServer.on('error', erred);
console.log('socketServer listening to port 3000');