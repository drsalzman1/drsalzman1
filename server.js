function wssConnected(ws) {
    function wsMessaged(buffer) {
        const msg = buffer.toString();
        console.log(`Server: message rxed: ${msg}`);
        ws.send(msg);
        console.log(`Server: message txed: ${msg}`);
    }

    function wsClosed() {
        console.log('Server: WebSocket closed');
    }

    function wsErred(error) {
        console.error('Server: WebSocket error');
    }

    console.log('Server: client connected');
    ws.on('message', wsMessaged);
    ws.on('close', wsClosed);
    ws.on('error', wsErred);
}

function wssErred(error) {
    console.error(error);
}

import {WebSocketServer} from 'ws';
const wss = new WebSocketServer({port:8080});
wss.on('connection', wssConnected);
wss.on('error', wssErred);