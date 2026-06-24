import { createServer } from 'http';
import { readFile } from 'fs';
import { join, basename } from 'path';
import { lookup } from 'mime-types';
import { WebSocketServer } from 'ws';

//-------------------- http server ---------------------------

const hsPort = 8080;

// Handle the http server's request e
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

// Handle the http server's listening e
function hsListening() {
    console.log(`HTTP file server listening to port:${hsPort}`);
}

// initialize http server
const hs = createServer(hsRequest);
hs.listen(hsPort, hsListening);

// ---------------------------------------Websocket Server Protocol--------------------------------------------
//
// From sender                                        In Game?  Server action
// ===========                                        ========  =============
// wsConnect(w,r) r.url=wss://games.koyeb.app/ws/           ?   pick w.id; reply {op:"id", id:i}
// wsConnect(w,r) r.url=wss://games.koyeb.app/ws/i          ?   set w.id, w.game; reply {op:"id", id:i}
// wsClose(e)                                               set socket[w.id] to null
//
// {op:"ping", turn:[]}                                     N   reply {op:"pong", turn:[]}
// {op:"ping", turn:[t]}                                    Y   update game; reply {op:"pong", turn:[t]}
// {op:"create", game:g}                                    N   if new/expired, create; otherwise, reply quitMsg
// {op:"list"}                                              N   reply recent {op:"list", game:[g]}
// {op:"join", game:g, name:n}                              N   add id; send {op:"join", name:n} to id[0]
//
// {op:"deal", name:[n], bot:[f], show:[f], value:[v]}      Y   update game; send {op:"pong", turn:[t]} to id[]
// {op:"bid", bid:b}                                        Y   update game; send {op:"pong", turn:[t]} to id[]
// {op:"declare", suit:s, toss:f}                           Y   update game; send {op:"pong", turn:[t]} to id[]
// {op:"play", card:c}                                      Y   update game; send {op:"pong", turn:[t]} to id[]
// {op:"quit", name:n}                                      Y   send {op:"quit", name:n} to others; delete game
// {op:"quit", name:n}                                      N   ignore

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
const expired = 24*60*60*1000;                                  // one day in milliseconds
const fresh = 5*60*1000;                                        // five minutes in milliseconds

////////////////
// Web Socket //
////////////////

// Send or queue message object m to websocket socket[i]
function sendMsg(i, m) {
    if (socket[i])                                              // if websocket is online, send stringified m
        socket[i].send(JSON.stringify(m));
    else
        queue[i].push(JSON.stringify(m));                       // otherwise, queue stringified m
}

// Handle a websocket's close event e
function wsClose(e) {
    const w = e.target;                                         // recall websocket
    console.log(`wsClose: id:${w.id}`);
}

// Handle a websocket's error event e
function wsError(e) {
    const w = e.target;
    console.log(`wsError: id:${w.id}`);
}

// Handle a websocket's message event e
function wsMessage(e) {
    const w = e.target;                                         // w is this websocket object
    const m = JSON.parse(e.data);                               // m is the message object
    const mTurn = "turn" in m;                                  // mTurn if m.turn is defined
    const mGame = "game" in m;                                  // mGame if m.Game is defined
    const mName = "name" in m;                                  // mName if m.name is defined
    const mBot = "bot" in m;                                    // mBot if m.bot is defined
    const mShow = "show" in m;                                  // mShow if m.show is defined
    const mValue = "value" in m;                                // mValue if m.value is defined
    const mBid = "bid" in m;                                    // mBid if m.bid is defined
    const mSuit = "suit" in m;                                  // mSuit if m.suit is defined
    const mToss = "toss" in m;                                  // mToss if m.toss is defined
    const mCard = "card" in m;                                  // mCard if m.card is defined
    const inGame = "game" in w;                                 // inGame if w.game is defined
    const oldGame = m.game && m.game in game;                   // oldGame if game[m.game] is defined
    if (!("id" in w)) {                                         // if no id in w,
        console.log(`(undefined) data:${e.data}`);                  // log error
        return;                                                     // return
    }
    if (!("op" in m)) {                                         // if no op in m,
        console.log(`(${w.game}.${w.id}) data:${e.data}`);          // log error
        return;                                                     // return
    }
    if (m.op=="ping" && mTurn && !inGame) {                     // if legal pingMsg and not in game,
        //console.log(`(${w.game}.${w.id}) op:ping, turn.length:${m.turn.length}`);
        sendMsg(w.id, {op:"pong", turn:[]});                        // reply with empty pongMsg
        return;                                                     // return
    }
    if (m.op=="ping" && mTurn && inGame) {                      // if legal pingMsg and in game,
        //console.log(`(${w.game}.${w.id}) op:ping, turn.length:${m.turn.length}`);
        for (let i=game[w.game].turn.length; i<m.turn.length; i++)  // add any missed turns to game
            game[w.game].turn[i] = m.turn[i];
        sendMsg(w.id, {op:"pong", turn:[...game[w.game].turn]});    // reply with pongMsg including any lost turns
        return;                                                     // return
    }
    if (m.op=="create" && mGame && !inGame) {                   // if legal createMsg and not in game,
        console.log(`(${w.game}.${w.id}) op:create, game:${m.game}`);
        if (!oldGame || game[m.game].date>Date.now()+expired) {     // if new game or expired game,
            delete game[m.game];                                        // delete expired game (if any)
            game[m.game] = {id:[w.id], date:Date.now(), turn:[]};       // create new game
            w.game = m.game;                                            // add game name to w object
        } else                                                      // otherwise,
            sendMsg(w.id, {op:"quit", name:m.game});                    // reject this createMsg
        return;                                                     // return
    }
    if (m.op=="list" && !inGame) {                              // if legal listMsg and not in game,
        console.log(`(${w.game}.${w.id}) op:list`);
        const list = [];
        for (const g in game)                                       // for each existing game,
            if (game[g].date < Date.now()+fresh)                        // if game is fresh,
                list.push(g);                                               // add game to list
        sendMsg(w.id, {op:"list", game:list});                      // reply with listMsg
        return;                                                     // return
    }
    if (m.op=="join" && mGame && mName && !inGame && oldGame) { // if legal joinMsg, not in game, and old game,
        console.log(`(${w.game}.${w.id}) op:join, game:${m.game}, name:${m.name}`);
        game[m.game].id.push(w.id);                                 // add this id to the game's id array
        w.game = m.game;                                            // add this game name to this w
        sendMsg(game[m.game].id[0], {op:"join", name:m.name});      // send joinMsg to starter
        return;                                                     // return
    }
    if (m.op=="deal"&&mName&&mBot&&mShow&&mValue && inGame) {   // if legal dealMsg and in game,
        console.log(`(${w.game}.${w.id}) op:deal, name:[${m.name}], bot:[${m.bot}], show:[${m.show}], value:[${m.value}]`);
        game[w.game].turn.push(m);                                  // add m to this game's turn array
        for (const id of game[w.game].id)                           // for each id associated with this game,
            sendMsg(id, {op:"pong", turn:game[w.game].turn});           // send a pongMsg
        return;                                                     // return
    }
    if (m.op=="bid" && mBid && inGame) {                        // if legal bidMsg and in game,
        console.log(`(${w.game}.${w.id}) op:bid, bid:${m.bid}`);
        game[w.game].turn.push(m);                                  // add m to this game's turn array
        for (const id of game[w.game].id)                           // for each id associated with this game,
            sendMsg(id, {op:"pong", turn:game[w.game].turn});           // send a pongMsg
        return;                                                     // return
    }
    if (m.op=="declare" && mSuit && mToss && inGame) {          // if legal declareMsg and in game,
        console.log(`(${w.game}.${w.id}) op:declare, suit:${m.suit}, toss:${m.toss}`);
        game[w.game].turn.push(m);                                  // add m to this game's turn array
        for (const id of game[w.game].id)                           // for each id associated with this game,
            sendMsg(id, {op:"pong", turn:game[w.game].turn});           // send a pongMsg
        return;                                                     // return
    }
    if (m.op=="play" && mCard && inGame) {                      // if legal playMsg and in game,
        console.log(`(${w.game}.${w.id}) op:play, card:${m.card}`);
        game[w.game].turn.push(m);                                  // add m to this game's turn array
        for (const id of game[w.game].id)                           // for each id associated with this game,
            sendMsg(id, {op:"pong", turn:game[w.game].turn});           // send a pongTurnMsg
        return;                                                     // return
    }
    if (m.op=="quit" && mName && inGame) {                      // if legal quitMsg and in game,
        console.log(`(${w.game}.${w.id}) op:quit, name:${m.name}`);
        for (const id of game[w.game].id)                           // for each id associated with this game,
            if (id != w.id) {                                           // if the id isn't the quitter's id,
                sendMsg(id, {op:"quit", name:m.name});                      // send a quitMsg
                delete socket[id].game;                                     // delete the id's game property
            }
        delete game[w.game];                                        // delete the game
        delete w.game;                                              // delete the quitter's game property
        return;                                                     // return
    }
    if (m.op=="quit" && mName && !inGame) {                     // if legal quitMsg and not in game,
        console.log(`(${w.game}.${w.id}) op:quit, name:${m.name}`); // log message
        return;                                                     // return
    }
    console.error(`(${w.game}.${w.id}) data:${e.data}`);        // log error
    return;                                                     // return
}

// Handle a websocket's open event e
function wsOpen(e) {
    const w = e.target;
    console.log(`wsOpen: id:${w.id}`);
}


///////////////////////
// Web Socket Server //
///////////////////////

// Handle the websocket server's close event e
function wssClose() {
    console.log(`wssClose:`);
}

// Handle a websocket server's connection event for websocket w and request r (w.id and w.game start undefined)
function wssConnection(w, r) {
    const bn = basename(r.url);                                 // bn is the request url's basename
    let id = /^\d+$/.test(bn)? Number(bn) : socket.length;      // id is from valid bn (or next socket index)
    w.id = id;                                                  // store id in this object
    for (const g in game)                                       // w.game = youngest game with this id (or undefined)
        if (game[g].id.includes(id) && (!w.game || game[g].born>game[w.game].born))
            w.game = g;
    queue[id] ??= [];                                           // don't crash when after server reboot
    socket[id] = w;                                             // (re)set socket[id]
    sendMsg(id, {op:"id", id:id});                              // send idMsg to client
    while (queue[id].length > 0)                                // send any queued stringified messages
        w.send(queue[id].pop());
    w.onclose = wsClose;                                        // prepare callbacks
    w.onerror = wsError;
    w.onmessage = wsMessage;
    w.onopen = wsOpen;
    console.log(`wssConnection: url:${r.url}, id:${id}`);
}

// Handle the websocket server's close event
function wssError() {
    console.log(`wssError`);
}

// Handle the websocket server's headers event
function wssHeaders(headers, request) {
    //console.log(`wssHeaders: headers:${headers}, request:${request}`);
}

// Handle the websocket server's listening event
function wssListening() {
    console.log(`websocket server listening to port:${wssPort}`);
}

// Handle the websocket server's wsClientError event
function wssWsClientError() {
    console.log(`wssWsClientError`);
}

// Initialize websocket server
const wss = new WebSocketServer({port:wssPort});
wss.on("close", wssClose);
wss.on("connection", wssConnection);
wss.on("error", wssError);
wss.on("headers", wssHeaders);
wss.on("listening", wssListening);
wss.on("wsClientError", wssWsClientError);