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

// ------------------------------------------Websocket server------------------------------------------------
//                                                                  
// Event               Actions
// =====               =======
// wsConnect(ws)       set ws.onclose and ws.onmessage
// wsMessage("ping")   send("pong") to ws
// wsMessage(data)     if s$ unregged, reg s$, send queued data to s$; send/queue data to regged/unreggrg dsts
// wsClose()           dereg ws
//
// data = JSON.stringify({src:s$, dst:[d$], msg:m$})
// s$ = source name (e.g. "South")
// [d$] = destination names (e.g. ["West", "North", "East"])
// m$ = JSON.stringify(m) (e.g. JSON.stringify({op:"join", joiner:p}))
// m = {op:"invite", player:[p0$..p3$], type[t0..t3], showTrump:f, showCount:f, showSummary:f, showDetail:f, showHand:f}
// m = {op:"join", joiner:p}
// m = {op:"deal", dealer:p, cardV[c0..c79]}
// m = {op:"bid",  bidder:p, bid[b0..b3]}
// m = {op:"pick", picker:p, trump:s}
// m = {op:"toss", tosser:p}
// m = {op:"play", player:p, card:c}
// m = {op:"quit", quitter:p}
// p = player value (e.g. south)
// t = type value (e.g. offline)
// f = flag value (e.g. false)
// c = card value (e.g. jack+diamonds)
// b = bid value (e.g. pass)
// s = suit value (e.g. diamonds)
//
//  Creator: wsConnect, [wsMessage], wsClose
//  Joiner:  wsConnect, [wsMessage], wsClose

const wsPort = 3000;    // websocket server port
const socket = {};      // src/dst name and websocket   {n1:ws, ...}
const mQueue = {};      // dst name and message queue   {d1:[messageEvent.data], ... }

// Handle a websocket server's connection event
function wsConnect(ws) {
    ws.onclose = wsClose;                                       // prepare callbacks
    ws.onmessage = wsMessage;
    console.log(`websocket connected`);
}

// Handle a websocket's close event
function wsClose(closeEvent) {
    const ws = closeEvent.target;                               // recall this websocket
    const n$ = Object.keys(socket).find(n$=>socket[n$]==ws);    // find name, if any, assigned to this websocket
    if (n$)                                                     // if name found,
        delete socket[n$];                                          // delete name and its socket from list
    console.log(`${n$}'s websocket closed`);
}

// Handle a websocket's message event
function wsMessage(messageEvent) {
    const ws = messageEvent.target;                             // recall this websocket
    if (messageEvent.data == "ping")                            // if message event data is "ping",
        ws.send("pong")                                             // respond with "pong"
    else {                                                      // otherwise,
        const data = JSON.parse(messageEvent.data);                 // parse message event data
        if (!socket[data.src]) {                                    // if src is unregistered,
            socket[data.src] = ws;                                      // register src
            if (mQueue[data.src])                                       // if src has queued messages,
                for (const med of mQueue[data.src])                         // for each queued message,
                    socket[data.src].send(med);                                 // respond with the queued message
            delete mQueue[data.src];                                    // delete src's message queue, if any
        }
        for (const dst of data.dst)                                 // for each dst,
            if (socket[dst])                                            // if dst is registered,
                socket[dst].send(messageEvent.data);                        // forward message to dst
            else                                                      // otherwise,
                if (!mQueue[dst])                                           // if dst doen't have a message queue
                    mQueue[dst] = [messageEvent.data];                          // create one
                else                                                        // otherwise,
                    mQueue[dst].push(messageEvent.data);                        // add message to the queue
        console.log(`src:${data.src}, dst:${data.dst}, msg:${data.msg}`);
    }
}

// Handle the websocket server's listening event
function wsListening() {
    console.log(`websocket server listening to port ${wsPort}`);
}

// Initialize websocket server
const wsServer = new WebSocketServer({port:wsPort});
wsServer.on('connection', wsConnect);
wsServer.on('listening', wsListening);