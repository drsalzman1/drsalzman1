import { createServer } from 'http';
import { readFile } from 'fs';
import { join, extname } from 'path';
const sseHeaders = {
    'Content-Type': 'text/event-stream', 
    'Cache-Control': 'no-cache', 
    'Connection': 'keep-alive'
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
let counter = 0;

function reqReceived(req, res) {
    function ticked() {
        res.write(`data: ${counter}\n\n`);
        console.log(`event sent: ${counter}`);
        counter++;
    }

    if (req.url == '/events') {
        console.log('events connected');
        res.writeHead(200, sseHeaders);
        setInterval(ticked, 1000);
    } else {
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
}

createServer(reqReceived).listen(8080);
console.log('fileServer initialized');

function connected(socket) {
    function messaged(buffer) {
        const msg = buffer.toString();
        console.log(`socket message rxed: ${msg}`);
        socket.send(msg == "ping" ? "pong" : msg);
        console.log(`socket message txed: ${msg == "ping" ? "pong" : msg}`);
    }

    function closed() {
        console.log('socket closed');
    }

    function erred(error) {
        console.error(`socket error: ${error}`);
    }

    console.log('socket connected');
    socket.on('message', messaged);
    socket.on('close', closed);
    socket.on('error', erred);
}

function erred(error) {
    console.log(`socketServer error: ${error}`);
}

import {WebSocketServer} from 'ws';
const socketServer = new WebSocketServer({port:3000});
socketServer.on('connection', connected);
socketServer.on('error', erred);
console.log('socketServer initialized');