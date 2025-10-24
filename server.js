import { createServer } from 'http';
import { readFile } from 'fs';
import { join } from 'path';
import { lookup } from 'mime-types';
import { WebSocketServer } from 'ws';

function reqReceived(req, res) {
    function read(error, content) {
        if (error) {
            res.writeHead(404, {'Content-Type': 'text/html'});
            res.end();
        } else {
            res.writeHead(200, {'Content-Type': lookup(filePath)});
            res.end(content, 'utf-8');
        }
    }

    const filePath = join(import.meta.dirname, req.url=='/'?'index.html':req.url);
    readFile(filePath, read);
}

createServer(reqReceived).listen(8080);
console.log('fileServer listening to port 8080');

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

    const id = Math.round(performance.now());
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