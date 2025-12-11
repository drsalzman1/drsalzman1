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

// ------------------------------------Websocket server---------------------------------------
//
//  From Sender                     To Sender                       To Affected Players
//  ===========                     =========                       ===================
//  (connect)                       (none)                          (none)
//  op:"ping"                       op:"pong"                       (none)
//  (close)                         (none)                          op:"offline", player:p$
//  op:"login", player:p$           (none)                          op:"online", player:p$
//  op:"poll", player:p$            op:"on(off)line", player:p$     (none)
//  op:"open", game:g$, data:d$     (none)                          (none)
//  op:"join", game:g$              (none)                          op:"online", player:p$
//  op:"put", game:g$, data:d$      op:"data", game:g$, data:d$     op:"data", game:g$, data:d$
//  op:"get", game:g$               op:"data", game:g$, data:d$     (none)
//  op:"inplay"                     op:"inplay", inplay:i$          (none)
//
// p$ = player name
// g$ = game name (creator's name)
// i$ = stringified i(nplay database)
// d$ = stringified d(ata payload)
// i = {g1:{player:[p$], data:d$}, ...}
// d = {state:opening, player:[p$], type:[t], showTrump:f, showCount:f, showSummary:f, showDetail:f, showHand:f}
// d = {state:dealing, dealer:p, cardV[v]}
// d = {state:bidding, bidder:p, bid[b]}
// d 
// p = player (0=west, 1=north, 2=east, 3=south from creator's perspective)
// v = card value (0=jack+diamonds ... 79=ace+spades)
// b = bid (or 0=pass or -1=none)
//
//  Opener: connect, login, open, [poll], [online], [put/get]
//  Joiner: connect, login, inplay, join, [poll], [online], [put/get]

const wsPort = 3000;    // websocket server port
const online = {};      // online players and their websockets      {p1:ws, ...}
const inplay = {};      // inplay games, players, and data          {g1:{player:[p$], data:d$}, ...}

// Handle a websocket server's connection event
function wsConnect(ws) {
    ws.onclose = wsClose;                                       // prepare callbacks
    ws.onmessage = wsMessage;
    console.log(`undefined: opened a websocket`);
}

// Handle a websocket's close event
function wsClose(closeEvent) {
    const ws = closeEvent.target;                               // recall this websocket
    const p$ = Object.keys(online).find(p$=>online[p$]==ws);    // find player, if any, assigned to this websocket
    if (p$) {                                                   // if player found,
        delete online[p$];                                          // delete player from online list
        for (const g$ in inplay)                                    // send "offline" reply to affected players
            if (inplay[g$].player.includes(p$))
                for (const a$ of inplay[g$].player)
                    if (online[a$])
                        online[a$].send(JSON.stringify({
                            op: "offline",
                            player: p$
                        }));
    }
    console.log(`${p$}: closed their websocket`);
}

// Handle a websocket's message event
function wsMessage(messageEvent) {
    const ws = messageEvent.target;                             // recall sender's websocket
    const msg = JSON.parse(messageEvent.data);                  // parse message from message event data
    const p$ = Object.keys(online).find(p$=>online[p$]==ws);    // find player, if any, assigned to this websocket
    switch (msg.op) {
        case "ping":                                            // if op:"ping",
            //console.log(`${p$}: ping`);
            ws.send(JSON.stringify({                                // send "pong" reply to sender
                op: "pong",
            }));
            break;
        case "login":                                           // if op:"login", player:p$,
            console.log(`${p$}: login player:${msg.player}`);
            for (const g$ in inplay)                                // send "online" message to affected players
                if (inplay[g$].player.includes(msg.player))
                    for (const a$ of inplay[g$].player)
                        if (online[a$])
                            online[a$].send(JSON.stringify({
                                op: "online",
                                player: msg.player
                            }));
            online[msg.player] = ws;                                // assign player to this websocket
            break;
        case "poll":                                            // if op:"poll", player:p$,
            console.log(`${p$}: poll player:${msg.player}`);
            ws.send(JSON.stringify({                                // send "online" or "offline" reply to sender
                op: online[msg.player]? "online" : "offline",
                player: msg.player
            }));
            break;
        case "open":                                            // if op:"open", game:g$, data:d$
            console.log(`${p$}: open game:${msg.game}, data:${msg.data}`);
            inplay[msg.game] = {player:[p$], data:msg.data};        // create or replace inplay object
            break;
        case "join":                                            // if op:"join", game:g$
            console.log(`${p$}: join game:${msg.game}`);
            for (const a$ of inplay[msg.game].player)               // send "online" message to affected players
                if (online[a$])
                    online[a$].send(JSON.stringify({
                        op: "online",
                        player: p$
                    }));
            inplay[msg.game].player.push(p$);                       // add player to game's player array
            break;
        case "put":                                             // if op:"put", game:g$, data:d$,
            console.log(`${p$} put game:${msg.game}, data:${msg.data}`);
            inplay[msg.game].data = msg.data;                       // save game data
            for (const a$ of inplay[msg.game].player)               // send "data" message to affected players
                if (online[a$])
                    online[a$].send(JSON.stringify({
                        op: "data",
                        game: msg.game,
                        data: msg.data
                    }));
            break;
        case "get":                                             // if op:"get", game:g$,
            console.log(`${p$}: get game:${msg.game}`);
            ws.send(JSON.stringify({                                // send "data" message to sender
                op: "data",
                game: msg.game,
                data: inplay[msg.game].data
            }));
            break;
        case "inplay":                                          // if op:"inplay",
            console.log(`${p$}: inplay ${JSON.stringify(inplay)}`);
            ws.send(JSON.stringify({                                // send "games" message to sender
                op: "inplay",
                inplay: JSON.stringify(inplay)
            }));
            break;
        default:                                                // if op is unrecognized, log msg
            console.log(`${p$}: received message '${msg}'`);
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