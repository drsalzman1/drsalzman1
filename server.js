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
// From sender                                        In Game?  Server action
// ===========                                        ========  =============
// wsConnect(ws,req) req.url=wss://games.koyeb.app/ws/       ?  pick ws.id; reply {op:"id", id:i}
// wsConnect(ws,req) req.url=wss://games.koyeb.app/ws/i      ?  set ws.id, ws.game; reply {op:"id", id:i}
// wsClose(event)                                               set socket[ws.id] to null
//
// {op:"ping", turn:[]}                                      N  reply {op:"pong", game:[g]}
// {op:"ping", turn:[t]}                                     Y  update game; reply {op:"pong", turn:[t]}
// {op:"start", game:g}                                      N  create game; set ws.game
// {op:"join", game:g, name:n}                               N  add id; send {op:"join", name:n} to id[0]
//
// {op:"deal", name:[n], bot:[f], show:[f], value:[v]}       Y  update game; send {op:"pong", turn:[t]} to id[]
// {op:"bid", bid:b}                                         Y  update game; send {op:"pong", turn:[t]} to id[]
// {op:"declare", suit:s, toss:f}                            Y  update game; send {op:"pong", turn:[t]} to id[]
// {op:"play", card:c}                                       Y  update game; send {op:"pong", turn:[t]} to id[]
// {op:"quit", name:n}                                       Y  send {op:"quit", name:n} to id[]; delete game
// {op:"quit", name:n}                                       N  ignore

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

// Send or queue message object
function sendMsg(id, msg) {
    if (socket[id])                                             // if id is online, send stringified msg object
        socket[id].send(JSON.stringify(msg));
    else
        queue[id].push(JSON.stringify(msg));                    // otherwise, queue stringified msg object
}

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
    const wGame = "game" in ws;                                 // wGame if ws.game is defined
    const mTurn = "turn" in msg;                                // mTurn if msg.turn is defined
    const mGame = "game" in msg;                                // mGame if msg.Game is defined
    const mName = "name" in msg;                                // mName if msg.name is defined
    const gGame = msg.game in game;                             // gGame if game[msg.game] is defined
    const mBot = "bot" in msg;                                  // mBot if msg.bot is defined
    const mShow = "show" in msg;                                // mShow if msg.show is defined
    const mValue = "value" in msg;                              // mValue if msg.value is defined
    const mBid = "bid" in msg;                                  // mBid if msg.bid is defined
    const mSuit = "suit" in msg;                                // mSuit if msg.suit is defined
    const mToss = "toss" in msg;                                // mToss if msg.toss is defined
    const mCard = "card" in msg;                                // mCard if msg.card is defined
    if (!("id" in ws)) {                                        // if no id,
        console.log(`(undefined) data:${event.data}`);              // log error
        return;                                                     // return
    }
    if (!("op" in msg)) {                                       // if no op,
        console.log(`(${ws.game}.${ws.id}) data:${event.data}`);    // log error
        return;                                                     // return
    }
    if (msg.op=="ping" && mTurn && !wGame) {                    // if legal pingMsg and ws isn't in a game,
        //console.log(`(${ws.game}.${ws.id}) op:ping, turn:[${msg.turn}]`);
        const list = [];
        for (const g in game)                                       // for each existing game,
            if (game[g].date < Date.now()+5*60*1000)                    // if game was born less than 5 minutes ago,
                list.push(g);                                               // add game to list
            else if (game[g].date > Date.now()+24*60*60*1000)           // if game was born more than 24 hours ago,
                delete game[g];                                             // delete game altogether
        sendMsg(ws.id, {op:"pong", game:list});                     // reply with pongGameMsg
        return;                                                     // return
    }
    if (msg.op=="ping" && mTurn && wGame) {                     // if legal pingMsg and ws is in a game,
        //console.log(`(${ws.game}.${ws.id}) op:ping, turn:[${msg.turn}]`);
        for (let i=game[ws.game].turn.length;i<msg.turn.length;i++) // add any missed turns to game
            game[ws.game].turn[i] = msg.turn[i];
        const list = [...game[ws.game].turn];
        sendMsg(ws.id, {op:"pong", turn:list});                     // reply with pongTurnMsg including any lost turns
        return;                                                     // return
    }
    if (msg.op=="start" && mGame && !wGame) {                   // if legal startMsg and ws isn't in a game,
        console.log(`(${ws.game}.${ws.id}) op:start, game:${msg.game}`);
        delete game[msg.game];                                      // delete old game (if any)
        game[msg.game] = {id:[ws.id], date:Date.now(), turn:[]};    // add new game property to game object
        ws.game = msg.game;                                         // add game name to ws object
        return;                                                     // return
    }
    if (msg.op=="join" && mGame && mName && !wGame && gGame) {  // if legal joinMsg, ws isn't in game & game in progress,
        console.log(`(${ws.game}.${ws.id}) op:join, game:${msg.game}, name:${msg.name}`);
        game[msg.game].id.push(ws.id);                              // add this id to the game's id array
        ws.game = msg.game;                                         // add this game name to this ws
        sendMsg(game[msg.game].id[0], {op:"join", name:msg.name});  // send joinMsg to starter
        return;                                                     // return
    }
    if (msg.op=="deal"&&mName&&mBot&&mShow&&mValue && wGame) {  // if legal dealMsg and ws is in a game,
        console.log(`(${ws.game}.${ws.id}) op:deal, name:[${msg.name}], bot:[${msg.bot}], show:[${msg.show}], value:[${msg.value}]`);
        game[ws.game].turn.push(msg);                               // add msg to this game's turn array
        for (const id of game[ws.game].id)                          // for each id associated with this game,
            sendMsg(id, {op:"pong", turn:game[ws.game].turn});          // send a pongTurnMsg
        return;                                                     // return
    }
    if (msg.op=="bid" && mBid && wGame) {                       // if legal bidMsg and ws is in a game,
        console.log(`(${ws.game}.${ws.id}) op:bid, bid:${msg.bid}`);
        game[ws.game].turn.push(msg);                               // add msg to this game's turn array
        for (const id of game[ws.game].id)                          // for each id associated with this game,
            sendMsg(id, {op:"pong", turn:game[ws.game].turn});          // send a pongTurnMsg
        return;                                                     // return
    }
    if (msg.op=="declare" && mSuit && mToss && wGame) {         // legal declareMsg and ws is in a game,
        console.log(`(${ws.game}.${ws.id}) op:declare, suit:${msg.suit}, toss:${msg.toss}`);
        game[ws.game].turn.push(msg);                               // add msg to this game's turn array
        for (const id of game[ws.game].id)                          // for each id associated with this game,
            sendMsg(id, {op:"pong", turn:game[ws.game].turn});          // send a pongTurnMsg
        return;                                                     // return
    }
    if (msg.op=="play" && mCard && wGame) {                     // if legal playMsg and ws is in a game,
        console.log(`(${ws.game}.${ws.id}) op:play, card:${msg.card}`);
        game[ws.game].turn.push(msg);                               // add msg to this game's turn array
        for (const id of game[ws.game].id)                          // for each id associated with this game,
            sendMsg(id, {op:"pong", turn:game[ws.game].turn});          // send a pongTurnMsg
        return;                                                     // return
    }
    if (msg.op=="quit" && mName && wGame) {                     // if legal quitMsg and ws is in a game,
        console.log(`(${ws.game}.${ws.id}) op:quit, name:${msg.name}`);
        const wsGame = ws.game;
        for (const id of game[wsGame].id) {                         // for each game id,
            sendMsg(id, {op:"quit", name:msg.name});                    // send quitMsg to id
            delete socket[id].game;                                     // delete id's game property
        }                                       
        delete game[wsGame];                                        // delete this game
        return;                                                     // return
    }
    if (msg.op=="quit" && mName && !wGame) {                    // if legal quitMsg and ws isn't in a game,
        console.log(`(${ws.game}.${ws.id}) op:quit, name:${msg.name}`);
        return;                                                     // return
    }
    console.log(`(${ws.game}.${ws.id}) data:${event.data}`);    // log error
    return;                                                     // return
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
        ws.id = id;                                                 // store id in this object
        queue[id] = [];                                             // no messages are queued for this id
        socket[id] = ws;                                            // save this ws
        sendMsg(id, {op:"id", id:id});                              // send idMsg to client
    } else {                                                    // otherwise,
        ws.id = id;                                                 // store id in this object
        for (const g in game)
            if (game[g].id.includes(id) && (!ws.game || game[g].born>game[ws.game].born))
                ws.game = g;
        queue[id] ??= [];                                           // don't crash when after server reboot
        socket[id] = ws;                                            // save this ws
        sendMsg(id, {op:"id", id:id});                              // send idMsg to client
        while (queue[id].length > 0)                                // send any queued stringified messages
            ws.send(queue[id].pop());
    }
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