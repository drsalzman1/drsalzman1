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
console.log('file server listening to port 8080');

const clients = [];

function logClients() {
    let msg = "the clients array is now";
    if (clients.length == 0) 
        msg += " empty";
    else
        for (let i = 0; i < clients.length; i++)
            msg += " " + clients[i].id;
    console.log(msg);
}

function webSocketServerConnected(webSocket) {
    function webSocketMessaged(buffer) {
        const msg = buffer.toString();
        if (msg == "ping")
            webSocket.send("pong");
        else
            console.log(`web socket ${id} rxed '${msg}'`);
    }

    function webSocketClosed() {
        console.log(`web socket ${id} closed`);
        const index = clients.findIndex((client) => {return client.id == id});
        if (index < 0)
            console.log(`web socket ${id} was not in the clients array`)
        else
            clients.splice(index, 1);
        logClients();
    }

    const id = Math.round(performance.now());
    clients.push({id:id, webSocket:webSocket});
    console.log(`web socket ${id} opened`);
    webSocket.send(`you are using web socket ${id}`)
    console.log(`web socket ${id} sent 'you are client ${id}'`)
    logClients();
    webSocket.on('message', webSocketMessaged);
    webSocket.on('close', webSocketClosed);
}

function webSocketServerErred(error) {
    console.log(`web socket server error: ${error}`);
}

const webSocketServer = new WebSocketServer({port:3000});
webSocketServer.on('connection', webSocketServerConnected);
webSocketServer.on('error', webSocketServerErred);
console.log('web socket server listening to port 3000');