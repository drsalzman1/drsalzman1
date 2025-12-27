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
// {op:"id", id:i}                                                  reclaim id following outage's close/connect
// {op:"join", name:n$, creator:i}                                  fix groups; send {op:"join", name:n$} to creator
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
// [n$] = array of 4 player names                                   name:["Bender", "Data", "Jarvis", "Creator"]
// [f]  = array of 4 bot flags                                      bot:[true, false, true, false]
// [f]  = array of 5 show flags                                     show:[true, true, true, false, false]
// [b]  = array of 4 bid values (none=-1, pass=0)                   bid:[0, 50, -1, -1]
// s    = suit value (diamonds=0, clubs=5, hearts=10, spades=15)    suit:0
// c    = card index in deck (0 to 79)                              card:62
//
//  creator: >wsConnect <id [<join] [>deal [<>bid] <>pick <>toss/ready [<>play]] >solo >wsClose
//  joiner:  >wsConnect <id  >join  [<deal [<>bid] <>pick <>toss/ready [<>play]] >solo >wsClose

const wsPort = 3000;                                            // websocket server port
const none = -1;                                                // result if search fails
const socket = [];                                              // socket[id] = id's websocket
const message = [];                                             // message[id] = id's message array
const group = [];                                               // group[id] = id's client array
let nextId = 0;                                                 // next id if no old nulls

// Handle a websocket server's connection event (if due to outage, assign a temporary id)
function wsConnect(ws) {
    let id = socket.indexOf(null);                              // id is first null socket (or none)
    if (id==none || id+500>nextId)                              // if none or null is too recent,
        id = nextId++;                                              // use nextId and increment nextId
    socket[id] = ws;                                            // initialize client's websocket reference
    message[id] = [];                                           // initialize client's message message
    group[id] = [];                                             // initialize client's group array
    ws.id = id;                                                 // save id in websocket object for quick reference
    ws.onclose = wsClose;                                       // prepare callbacks
    ws.onmessage = wsMessage;
    ws.send(JSON.stringify({op:"id", id:id}));                  // notify connector of their, perhaps temporary, id
    console.log(`opened id:${ws.id}`);
}

// Handle a websocket's close event
function wsClose(closeEvent) {
    const ws = closeEvent.target;                               // recall websocket
    socket[ws.id] = null;                                       // deref websocket, but not message or group in case of outage
    console.log(`closed id:${ws.id}`);
}

// Handle a websocket's message event
function wsMessage(messageEvent) {
    const ws = messageEvent.target;                             // recall this websocket
    const msg = JSON.parse(messageEvent.data);                  // parse message data
    switch (msg.op) {
    case "ping":                                                // if {op:"ping"},
        //console.log(`rxed op:ping from id:${ws.id}`);
        ws.send(JSON.stringify({op:"pong"}));                       // send {op:"pong"}
        //console.log(`-- txed op:pong to id:${ws.id}`);
        break;
    case "id":                                                  // if {op:"id", id:i}, (reclaim previous id due to outage)
        console.log(`rxed op:id, id:${msg.id} from id:${ws.id}`);
        const tempId = ws.id;                                       // get temporary id assigned to this websocket
        ws.id = msg.id;                                             // store previous id in websocket for quick reference
        socket[ws.id] = ws;                                         // store id's new websocket reference (message/group ok)
        socket[tempId] = null;                                      // recycle temporary id
        console.log(`-- reassigned tempId:${tempId} to id:${ws.id}`);
        message[ws.id] ??= [];                                      // keep server from crashing after server is restarted
        group[ws.id] ??= [];
        for (const m of message[ws.id]) {                           // send queued messages to this websocket
            ws.send(m);
            console.log(`-- txed queued message:${m} to id:${ws.id}`);
        }
        message[ws.id].length = 0;                                  // clear this message message
        break;
    case "join":                                                // if {op:"join", name:p$, creator:i},
        console.log(`rxed op:join, name:${msg.name}, creator:${msg.creator} from id:${ws.id}`);
        group[ws.id].push(msg.creator, ...group[msg.creator]);      // add creator and creator's group to joiner's group
        console.log(`-- group[${ws.id}]:${group[ws.id]}`);
        for (const member of group[msg.creator]) {                  // for each member of creator's group,
            group[member].push(ws.id);                                  // add joiner to member's group
            console.log(`-- group[${member}]:${group[member]}`);
        }
        group[msg.creator].push(ws.id);                             // add joiner to creator's group
        console.log(`-- group[${msg.creator}]:${group[msg.creator]}`);
        if (socket[msg.creator]) {                                  // if creator is online, send notification to creator
            socket[msg.creator].send(JSON.stringify({op:"join", name:msg.name}));
            console.log(`-- txed op:join, name:${msg.name} to id:${msg.creator}`);
        } else {                                                    // otherwise, queue notification for creator
            message[msg.creator].push(JSON.stringify({op:"join", name:msg.name}));
            console.log(`-- queued op:join, name:${msg.name} to id:${msg.creator}`);
        }
        break;
    case "solo":                                                // if {op:"solo"},
        console.log(`rxed op:solo from ${ws.id}`)
        group[ws.id].length = 0;                                    // clear solo's group
        console.log(`-- group[${ws.id}]:${group[ws.id]}`);
        break
    default:                                                    // otherwise, send or queue message to sender's group
        console.log(`rxed message:${messageEvent.data} from id:${ws.id}`);
        for (const member of group[ws.id])
            if (socket[member]) {
                socket[member].send(messageEvent.data);
                console.log(`-- txed message:${messageEvent.data} to id:${member}`);
            } else {
                message[member].push(messageEvent.data);
                console.log(`-- queued message:${messageEvent.data} for id:${member}`);
            }
    }
}

// Handle the websocket server's listening event
function wsListening() {
    console.log(`listening to port ${wsPort}`);
}

// Initialize websocket server
const wsServer = new WebSocketServer({port:wsPort});
wsServer.on('connection', wsConnect);
wsServer.on('listening', wsListening);