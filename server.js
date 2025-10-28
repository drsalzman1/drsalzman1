import { createServer } from 'http';
import { readFile } from 'fs';
import { join } from 'path';
import { lookup } from 'mime-types';
import { WebSocketServer } from 'ws';

//-------------------- http server ---------------------------

const hsPort = 8080;

// Handle the http server's request event
function hsRequest(request, response) {
    const filePath = join(import.meta.dirname, request.url=='/'?'index.html':request.url);
    readFile(filePath, (error, content) => {
        if (error) {
            response.writeHead(404, {'Content-Type': 'text/html'});
            response.end();
        } else {
            response.writeHead(200, {'Content-Type': lookup(filePath)});
            response.end(content, 'utf-8');
        }
    });
}

// Handle the http server's listening event
function hsListening() {
    console.log(`http server listening to port ${hsPort}`);
}

// initialize http server
const hs = createServer(hsRequest);
hs.listen(hsPort, hsListening);

//--------------------- websocket server -----------------------

// websocket server port
const wssPort = 3000;
const normalClosure = 1000;
const tlsHandshake = 1015;
const closeReason = [
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

const websocket = [];                                           // websocket[wx] is the websocket for websocket wx

// Handle a websocket's close event
function wsClose(closeEvent) {
    const code = closeEvent.code;                               // recall close code
    const ws = closeEvent.target;                               // recall websocket
    const wx = ws.wx;                                           // recall websocket index
    let reason = code.toString();                               // translate close code to close reason
    if (code>=normalClosure && code<=tlsHandshake)
        reason = closeReason[code - normalClosure];
    console.log(`websocket ${wx} closed due to '${reason}'${websocket[wx]==null?" while closed":""}`);
    ws.onclose = null;
    ws.onmessage = null;
    websocket[wx] = null;
}

// Handle a websocket's message event
function wsMessage(messageEvent) {
    const msg = JSON.parse(messageEvent.data);                  // parse msg from data
    const ws = messageEvent.target;                             // recall websocket
    const wx = ws.wx;                                           // recall websocket index
    if (websocket[wx] == null)                                  // if this websocket is closed, log error
        console.log(`websocket ${wx} rxed message '${msg}' while closed`);
    if (msg.wx != wx)                                           // if wrong wx, log error
        console.log(`websocket ${wx} rxed message '${msg}'`);
    switch (msg.op) {
        case "ping":                                            // if op is ping, send pong
            ws.send(`{"op":"pong", "wx":"${wx}"}`);
            break;
        case "create":
            gp = group.length;
            group[gp] = [wx];
            ws.send(`{"op":"pong", "wx":"${wx}"}`)
        default:                                                // if op is unknown, log msg
            console.log(`websocket ${wx} rxed '${msg}'`);
    }
}

// Handle the websocket server's connection event
function wssConnection(ws) {
    let wx = 0;                                                 // find first available websock index (may be at end)
    while (websocket[wx])
        wx++;
    websocket[wx] = ws;                                         // save websocket
    ws.wx = wx;                                                 // save websock index
    ws.onclose = wsClose;                                       // prepare callbacks
    ws.onmessage = wsMessage;
    ws.send(`{"op":"assign", "wx":"${wx}"}`);                   // inform client of their new(?) wx
    console.log(`websocket ${wx} opened`);
}

// Handle the websocket server's listening event
function wssListening() {
    console.log(`websocket server listening to port ${wssPort}`);
}

// Initialize websocket server
const wss = new WebSocketServer({port:wssPort});
wss.on('connection', wssConnection);
wss.on('listening', wssListening);