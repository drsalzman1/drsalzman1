import { createServer } from 'http';
import { readFile } from 'fs';
import { join, basename } from 'path';
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
    console.log(`listening to port ${hsPort}`);
}

// initialize http server
const hs = createServer(hsRequest);
hs.listen(hsPort, hsListening);

// --------------------------------------------Websocket Server Protocol--------------------------------------------
//
// From sender                                                      Server action
// ===========                                                      =============
// wsConnect(ws)                                                    set ws.id; reply {op:"id", id:i}
// wsClose(closeEvent)                                              socket[closeEvent.target.id]=null
// {op:"ping"}                                                      reply {op:"pong"}
// {op:"join", name:n$, starter:i}                                  fix groups; send {op:"join", name:n$} to starter
// {op:"solo"}                                                      clear sender's group
// {op:"deal", player:p, value:[v], name:[n$], bot:[f], show:[f]}   forward message to sender's group
// {op:"bid",  player:p, bid[b]}                                    forward message to sender's group
// {op:"pick", suit:s}                                              forward message to sender's group
// {op:"toss"}                                                      forward message to sender's group
// {op:"ready", player:p}                                           forward message to sender's group
// {op:"play", card:c}                                              forward message to sender's group
//
// Parameters                                                       Example
// ==========                                                       =======
// i    = player identifier (index of player's websocket)           id:1234
// n$   = player name                                               name:"Grampy"
// p    = player index (left=0, across=1, right=2, origin=3)        player:3
// [v]  = array of 80 card values (suit + rank=0..4 for JQKTA)      value:[0, 0, 0, 0, ...19, 19, 19, 19]
// [n$] = array of 4 player names                                   name:["Bender", "Data", "Jarvis", "Starter"]
// [f]  = array of 4 bot flags                                      bot:[true, false, true, false]
// [f]  = array of 5 show flags                                     show:[true, true, true, false, false]
// [b]  = array of 4 bid values (none=-1, pass=0)                   bid:[0, 50, -1, -1]
// s    = suit value (diamonds=0, clubs=5, hearts=10, spades=15)    suit:0
// c    = card index in deck (0 to 79)                              card:62
//
//  starter: >wsConnect <id [<join] [>deal [<>bid] <>pick <>toss/ready [<>play]] >solo >wsClose
//  joiner:  >wsConnect <id  >join  [<deal [<>bid] <>pick <>toss/ready [<>play]] >solo >wsClose

const wssPort = 3000;                                           // websocket server port
const none = -1;                                                // result if search fails
const socket = [];                                              // socket[id] = id's websocket
const message = [];                                             // message[id] = id's message array
const group = [];                                               // group[id] = id's client array
let nextId = 0;                                                 // next id if no old nulls

////////////////
// Web Socket //
////////////////

// Handle a websocket's close event
function wsClose(closeEvent) {
    const ws = closeEvent.target;                               // recall websocket
    socket[ws.id] = null;                                       // deref websocket, but not message or group in case of outage
    console.log(`wsClose: id:${ws.id}`);
}

// Handle a websocket's error event
function wsError() {
    console.log(`wsError: id:${ws.id}`);
}

// Handle a websocket's message event
function wsMessage(messageEvent) {
    const ws = messageEvent.target;                             // recall this websocket
    const msg = JSON.parse(messageEvent.data);                  // parse message data
    switch (msg.op) {
    case "ping":                                                // if {op:"ping"},
        ws.send(JSON.stringify({op:"pong"}));                       // send {op:"pong"}
        break;
    case "join":                                                // if {op:"join", name:p$, starter:i},
        console.log(`wsMessage: rxed op:join, name:${msg.name}, starter:${msg.starter} from id:${ws.id}`);
        group[ws.id].push(msg.starter, ...group[msg.starter]);      // add starter and starter's group to joiner's group
        console.log(`wsMessage: group[${ws.id}]:${group[ws.id]}`);
        for (const member of group[msg.starter]) {                  // for each member of starter's group,
            group[member].push(ws.id);                                  // add joiner to member's group
            console.log(`wsMessage: group[${member}]:${group[member]}`);
        }
        group[msg.starter].push(ws.id);                             // add joiner to starter's group
        console.log(`wsMessage: group[${msg.starter}]:${group[msg.starter]}`);
        if (socket[msg.starter]) {                                  // if starter is online, send notification to starter
            socket[msg.starter].send(JSON.stringify({op:"join", name:msg.name}));
            console.log(`wsMessage: txed op:join, name:${msg.name} to id:${msg.starter}`);
        } else {                                                    // otherwise, queue notification for starter
            message[msg.starter].push(JSON.stringify({op:"join", name:msg.name}));
            console.log(`wsMessage: queued op:join, name:${msg.name} to id:${msg.starter}`);
        }
        break;
    case "solo":                                                // if {op:"solo"},
        console.log(`wsMessage: rxed op:solo from ${ws.id}`)
        group[ws.id].length = 0;                                    // clear solo's group
        console.log(`wsMessage: group[${ws.id}]:${group[ws.id]}`);
        break
    default:                                                    // otherwise, send or queue message to sender's group
        console.log(`wsMessage: rxed message:${messageEvent.data} from id:${ws.id}`);
        for (const member of group[ws.id])
            if (socket[member]) {
                socket[member].send(messageEvent.data);
                console.log(`wsMessage: txed message:${messageEvent.data} to id:${member}`);
            } else {
                message[member].push(messageEvent.data);
                console.log(`wsMessage: queued message:${messageEvent.data} for id:${member}`);
            }
    }
}

// Handle a websocket's open event
function wsOpen() {
    console.log(`wsOpen: id:${ws.id}`);
}


///////////////////////
// Web Socket Server //
///////////////////////

// Handle the websocket server's close event
function wssClose() {
    console.log(`wssClose:`);
}

// Handle a websocket server's connection event (url's basename, if any, is closed id)
function wssConnection(ws, req) {
    const bn = basename(req.url);                               // bn is the basename
    let id = /^\d+$/.test(bn)? Number(bn) : none;               // id is from valid bn (or none)
    if (id==none || socket[id]) {                               // if id invalid or id open, pick a new id
        id = socket.indexOf(null);                                  // id is the first null socket
        if (id==none || id+500>nextId) {                            // if none or too recent,
            id = nextId++;                                              // id is the nextId, then increment nextId
            while (socket[id])                                          // while id is open,
                id = nextId++;                                              // skip this id, then increment nextId
        }
        message[id] = [];                                           // initialize client's message message
        group[id] = [];                                             // initialize client's group array
    }
    message[id] ??= [];                                         // if server rebooted, don't crash
    group[id] ??= [];
    socket[id] = ws;                                            // initialize client's websocket reference
    ws.id = id;                                                 // save id in websocket object for quick reference
    ws.onclose = wsClose;                                       // prepare callbacks
    ws.onerror = wsError;
    ws.onmessage = wsMessage;
    ws.onopen = wsOpen;
    ws.send(JSON.stringify({op:"id", id:id}));                  // notify connector of their id
    console.log(`wssConnection: id:${id}`);
    for (const m of message[id]) {                              // send queued messages to this websocket
        ws.send(m);
        console.log(`wsMessage: txed queued message:${m} to id:${id}`);
    }
    message[id].length = 0;                                     // clear this message message
}

// Handle the websocket server's close event
function wssError() {
    console.log(`wssError:`);
}

// Handle the websocket server's headers event
function wssHeaders() {
    console.log(`wssHeaders:`);
}

// Handle the websocket server's listening event
function wssListening() {
    console.log(`wssListening: port:${wssPort}`);
}

// Handle the websocket server's wsClientError event
function wssWsClientError() {
    console.log(`wssWsClientError:`);
}

// Initialize websocket server
const wss = new WebSocketServer({port:wssPort});
wss.on('close', wssClose);
wss.on('connection', wssConnection);
wss.on('error', wssError);
wss.on('headers', wssHeaders);
wss.on('listening', wssListening);
wss.on('wsClientError', wssWsClientError);