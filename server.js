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

// ---------------------------------------Websocket Server Protocol--------------------------------------------
//
// From sender                                                  Server action
// ===========                                                  =============
// wsConnect(ws,req) req.url=wss://games.koyeb.app/ws/          pick ws.id; reply {op:"id", id:i}
// wsConnect(ws,req) req.url=wss://games.koyeb.app/ws/i         set ws.id, ws.game; reply {op:"id", id:i}
// wsClose(event)                                               set socket[ws.id] to null
//
// {op:"ping", turn:[t]}                                        update game; send {op:"do", turn:[t]} to sender
// {op:"start", game:g}                                         create game; set ws.game
// {op:"list"}                                                  send {op:"list", game:[g]} to sender
// {op:"join", game:g, name:n}                                  add id; send {op:"join", name:n} to id[0]
//
// {op:"deal", name:[n], bot:[f], show:[f], value:[v]}          update game; send {op:"do", turn:[t]} to id
// {op:"bid", bid:b}                                            update game; send {op:"do", turn:[t]} to id
// {op:"declare", suit:s, toss:f}                               update game; send {op:"do", turn:[t]} to id
// {op:"play", card:c}                                          update game; send {op:"do", turn:[t]} to id
//
// Parameters                                                   Example
// ==========                                                   =======
// b = bidder's bid (none=-1, pass=0)                           bid:50
// c = card index (0 to 79) from starter's perspective          card:62
// f = flag (true, false)                                       toss:false
// g = game name (game starter's name)                          game:"Grampy"
// i = socket index                                             id:1234
// n = player name                                              name:"Grampy"
// s = suit value (diamonds=0, clubs=5, hearts=10, spades=15)   suit:0
// t = turn object                                              turn:[{op:"bid", bid:50}]
// v = card value (suit + rank=0..4 for JQKTA)                  value:[0, 0, 0, 0, ...19, 19, 19, 19]

const wssPort = 3000;                                           // websocket server port
const none = -1;                                                // result if search fails
const socket = [];                                              // socket[id] = id's websocket
const queue = [];                                               // queue[id] = id's offline queue
const game = {};                                                // {g1:{id:[i], date:d, turn:[t]}, g2:{}, ...}

////////////////
// Web Socket //
////////////////

// Handle a websocket's close event
function wsClose(event) {
    const ws = event.target;                                    // recall websocket
    socket[ws.id] = null;                                       // deref socket, but not queue or game in case of outage
    console.log(`wsClose: id:${ws.id}`);
}

// Handle a websocket's error event
function wsError(event) {
    const ws = event.target;
    console.log(`wsError: id:${ws.id}`);
}

// Handle a websocket's message event
function wsMessage(event) {
    const ws = event.target;                                    // recall this websocket
    const msg = JSON.parse(event.data);                         // parse message data
    switch (msg.op) {
    case "ping":                                                // if {op:"ping", turn[t]},
        if (ws.game) {                                              // if client is in a game,
            if (game[ws.game].turn.length < msg.turn.length)            // if game missed client's turn(s),
                game[ws.game].turn = [...msg.turn];                         // update game's turn array
            ws.send(JSON.stringify({op:"do",turn:game[ws.game].turn})); // send {op:"do", turn:[t]} to client incl. lost turns
        } else                                                      // otherwise,
            ws.send(JSON.stringify({op:"do",turn:[]}));                 // send {op:"do", turn:[]} to client
        break;
    case "start":                                               // if {op:"start", game:g},
        console.log(`wsConnect: op:start, game:${msg.game} from ${ws.id}`);
        delete game[msg.game];                                      // delete old game (if any)
        game[msg.game] = {id:[ws.id], date:Date.now(), msg:[]};     // add new game property to game object
        ws.game = msg.game;                                         // add game name to ws object
        break;
    case "list":                                                // if {op:"list"},
        const list = [];
        for (const g in game)                                       // for each existing game,
            if (game[g].date < Date.now()+5*60*1000)                    // if game was born less than 5 minutes ago,
                list.push(g);                                               // add game to list
            else if (game[g].date > Date.now()+24*60*60*1000)           // if game was born more than 24 hours ago,
                delete game[g];                                             // delete game altogether
        ws.send(JSON.stringify({op:"list", game:list}));            // reply {op:"list", game:[g]}
        console.log(`wsConnect: op:list, game:${list} to ${ws.id}`);
        break;
    case "join":                                                // if {op:"join", game:g, player:p},
        console.log(`wsMessage: op:join, game:${msg.game}, player:${msg.player} from id:${ws.id}`);
        if (!game[msg.game] || game[msg.game].id.includes(ws.id))   // if joining non-existent game or already joined,
            return;                                                     // ignore join message
        game[msg.game].id.push(ws.id);                              // add this id to the game's id array
        ws.game = msg.game;                                         // add this game name to this ws
        if (socket[game[msg.game].id[0]])                           // if starter is online, notify starter
            socket[game[msg.game].id[0]].send(JSON.stringify({op:"join", player:msg.player}));
        else                                                        // otherwise, queue notification for starter
            queue[game[msg.game].id[0]].push(JSON.stringify({op:"join", player:msg.player}));
        break;
    default:                                                    // otherwise (turn),
        if (ws.game) {                                              // if in game,
            game[ws.game].turn.push(msg);                               // store turn object
            for (const id of game[ws.game].id)                          // for each game id,
                if (socket[id])                                             // send or queue {op:"do", turn:[t]} to id
                    socket[id].send(JSON.stringify({op:"do",turn:game[ws.game].turn}));
                else
                    queue[id].push(JSON.stringify({op:"do",turn:game[ws.game].turn}));
            console.log(`wsMessage: ${event.data} from ${ws.id} to ${game[ws.game].id}`);
        }
    }
}

// Handle a websocket's open event
function wsOpen(event) {
    const ws = event.target;
    console.log(`wsOpen: id:${ws.id}`);
}


///////////////////////
// Web Socket Server //
///////////////////////

// Handle the websocket server's close event
function wssClose() {
    console.log(`wssClose:`);
}

// Handle a websocket server's connection event for websocket ws and request req
function wssConnection(ws, req) {
    const bn = basename(req.url);                               // bn is the request url's basename
    let id = /^\d+$/.test(bn)? Number(bn) : none;               // id is from valid bn (or none)
    if (id==none || socket[id]) {                               // if id invalid or that socket is already open,
        id = socket.indexOf(null);                                  // find first null socket
        if (id==none || id+500>socket.length)                       // if no null or first is too young, id is a new socket
            id = socket.length;
        ws.game = "";                                               // save empty game name
        queue[id] = [];                                             // no messages are queued for this id
        ws.send(JSON.stringify({op:"id", id:id}));                  // notify connector of their id
    } else {                                                    // otherwise,
        ws.game = "";                                               // save youngest game name that includes this id
        for (const g in game)
            if (game[g].id.includes(id) && (!ws.game || game[g].born>game[ws.game].born))
                ws.game = g;
        ws.send(JSON.stringify({op:"id", id:id}));                  // notify connector of their id
        queue[id] ??= [];                                           // don't crash when after server reboot
        while (queue[id].length > 0)                                // send any queued messages
            ws.send(queue[id].pop());
    }
    socket[id] = ws;                                            // save this ws
    ws.id = id;                                                 // save id in this ws
    ws.onclose = wsClose;                                       // prepare callbacks
    ws.onerror = wsError;
    ws.onmessage = wsMessage;
    ws.onopen = wsOpen;
    console.log(`wssConnection: url:${req.url}, id:${id}`);
}

// Handle the websocket server's close event
function wssError() {
    console.log(`wssError:`);
}

// Handle the websocket server's headers event
function wssHeaders(headers, request) {
    //console.log(`wssHeaders: headers:${headers}, request:${request}`);
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
wss.on("close", wssClose);
wss.on("connection", wssConnection);
wss.on("error", wssError);
wss.on("headers", wssHeaders);
wss.on("listening", wssListening);
wss.on("wsClientError", wssWsClientError);