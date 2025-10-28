import { createServer } from 'http';
import { readFile } from 'fs';
import { join } from 'path';
import { lookup } from 'mime-types';
import { WebSocketServer } from 'ws';

//-------------------- http server ---------------------------

const hsPort = 8080;

// Handle http server's request event's request and response
function hsRequest(request, response) {

    // Handle readFile's callback's error and content
    function readFileCallback(error, content) {
        if (error) {
            response.writeHead(404, {'Content-Type': 'text/html'});
            response.end();
        } else {
            response.writeHead(200, {'Content-Type': lookup(filePath)});
            response.end(content, 'utf-8');
        }
    }

    // Handle http server's request event's request and response
    const filePath = join(import.meta.dirname, request.url=='/'?'index.html':request.url);
    readFile(filePath, readFileCallback);
}

function hsListening() {
    console.log(`http server listening to port ${hsPort}`);
}

// initialize http server
const hs = createServer(hsRequest);                             // adds hsRequest to http server's request event listener
hs.listen(hsPort, hsListening);

//--------------------- websocket server -----------------------

// websocket server port
const wssPort = 3000;
const normalClosure = 1000;
const tlsHandshake = 1015;
const errorReason = [
    'Normal Closure', 
    'Going Away', 
    'Protocol error', 
    'Unsupported Data', 
    'Reserved', 
    'No Status Received', 
    'Abnormal Closure', 
    'Invalid frame payload data', 
    'Policy Violation', 
    'Message Too Big', 
    'Mandatory Ext.', 
    'Internal Error', 
    'Service Restart', 
    'Try Again Later', 
    'Bad Gateway', 
    'TLS handshake'
];


const websocket = [];                                           // websocket[id] is the websocket for websocket id

// Handle a websocket's close event
function wsClose(closeEvent) {
    const code = closeEvent.code;
    const ws = closeEvent.target;
    const id = ws.id;
    let reason = code.toString();
    if (code>=normalClosure && code<=tlsHandshake)
        reason = errorReason[code - normalClosure];
    console.log(`websocket ${id} closed due to '${reason}'`);
    ws.onclose = null;
    ws.onmessage = null;
    websocket[id] = null;
}

// Handle a websocket's message event
function wsMessage(messageEvent) {
    const msg = JSON.parse(messageEvent.data);                  // parse msg from data
    const ws = messageEvent.target;
    const id = ws.id;
    if (msg.id != id)                                           // if wrong id, log error
        console.log(`websocket ${id} rxed message '${msg}'`);
    if (msg.op == "ping")                                       // if op is ping, send pong
        ws.send(`{"op":"pong", "id":"${id}"}`);
    else                                                        // otherwise, log msg and isBinary
        console.log(`websocket ${id} rxed '${msg}'`);
}

// Handle the websocket server's connection event
function wssConnection(ws, req) {
    let id = websocket.length;
    websocket[id] = ws;                                         // assign this websocket to this id
    ws.id = id;
    ws.onclose = wsClose;
    ws.onmessage = wsMessage;
    ws.send(`{"op":"assign", "id":"${id}"}`);
    console.log(`websocket ${id} assigned`);
}

// Handle the websocket server's listening event
function wssListening() {
    console.log(`websocket server listening to port ${wssPort}`);
}

// Initialize websocket server
const wss = new WebSocketServer({port:wssPort});
wss.on('connection', wssConnection);
wss.on('listening', wssListening);