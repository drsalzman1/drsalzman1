import { createServer } from 'http';
import { readFile } from 'fs';
import { join, basename } from 'path';
import { lookup } from 'mime-types';
import { WebSocketServer } from 'ws';
import { networkInterfaces } from 'os';

//-------------------- http server ---------------------------

const hsPort = 8080;

// Handle the http server's request e
function hsRequest(request, response) {
    const filePath = join(import.meta.dirname, request.url=='/'?'index.html':request.url);
    //console.log(filePath);
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
    console.log(`HTTP file server listening to port: ${hsPort}`);
}

// initialize http server
createServer(hsRequest).listen(hsPort, hsListening);

// ----------------------------------------Websocket Server Protocol--------------------------------------
//
// From sender                                          Server action
// ===========                                          =============
// wsConnect(w,r) r.url=wss://pinochle.koyeb.app/ws/    pick w.id, reply {op:"id", id:i}
// wsConnect(w,r) r.url=wss://pinochle.koyeb.app/ws/i   set w.id, set w.game, reply {op:"id", id:i}
// wsClose(e)                                           set socket[w.id] to null
//
// {op:"ping", turn:[t]}                                {op:"pong", turn:[t]} back
// {op:"create", name:[n], show:[f]}                    terminate player's old games, create new game
// {op:"join", name:n}                                  OK? join to creator, create back : quit back
//
// {op:"deal", value:[v]}                               {op:"pong", turn:[t]} to players
// {op:"bid", bid:b}                                    {op:"pong", turn:[t]} to players
// {op:"declare", suit:s, toss:f}                       {op:"pong", turn:[t]} to players
// {op:"play", card:c}                                  {op:"pong", turn:[t]} to players
// {op:"quit", reason:r}                                {op:"quit", reason:r} to others

// Parameters                                           Example
// ==========                                           =======
// b = bid (none=-1, pass=0)                            bid:50
// c = card (0=name[0]'s first, 79=creator's last)      card:62
// f = flag (show[0]=counts, show[1]=hands)             toss:false
// g = game (also known as creator)                     game:"Grampy"
// i = socket (id[0]=creator's socket)                  id:1234
// n = player (name[3]=creator's name)                  name:"Grampy"
// r = reason                                           reason:"duplicate game"
// s = suit (diamonds=0, clubs=5, hearts=10, spades=15) suit:0
// t = turn (turn[0]=first dealMsg)                     turn:[{op:"deal",value:[0,0,0,0,...19,19,19,19]}]
// v = value (value[c]=value of card c; J♦=0; A♠=19)    value:[0,0,0,0,...19,19,19,19]

const wssPort = 3000;                                   // websocket server port
const none = -1;                                        // result if search fails
const socket = [];                                      // socket[i] = i's websocket
const queue = [];                                       // queue[i] = i's offline queue
const game = {};                                        // {g1:{name:[n], show:[f], turn:[t]}, g2:{}, ...}
const expired = 24*60*60*1000;                          // one day in milliseconds
const fresh = 5*60*1000;                                // five minutes in milliseconds
const name = {};                                        // {n1:{w1}, n2:{w2}, ...}

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
    const m = JSON.parse(e.data);                               // m is this message object
    const turn = "turn" in m;                                   // flag message keys
    const name = "name" in m;
    const bot = "bot" in m;
    const show = "show" in m;
    const value = "value" in m;
    const bid = "bid" in m;
    const suit = "suit" in m;
    const toss = "toss" in m;
    const card = "card" in m;
    if (!("id" in w)) {                                         // if no id in w,
        console.log(`(undefined) data:${e.data}`);                  // log error
        return;                                                     // return
    }
    if (!("op" in m)) {                                         // if no op in m,
        console.log(`(${w.game}.${w.id}) data:${e.data}`);          // log error
        return;                                                     // return
    }
    if (m.op=="ping" && turn) {                                 // if legal pingMsg,
        //console.log(`(${w.game}.${w.id}) op:ping, turn.length:${m.turn.length}`);
        if ("game" in w) {                                          // if in game,
            for (let i=game[w.game].turn.length; i<m.turn.length; i++)  // add any missed turns to game
                game[w.game].turn[i] = m.turn[i];
            sendMsg(w.id, {op:"pong", turn:[...game[w.game].turn]});    // reply with pongMsg including any lost turns
        } else                                                      // otherwise,
            sendMsg(w.id, {op:"pong", turn:[]});                        // reply with empty pongMsg
        return;                                                     // return
    }
    if (m.op=="create" && name && show && !("game" in w)) {     // if legal createMsg and not in game,
        console.log(`(${w.game}.${w.id}) op:create, name:${m.name}, show:${m.show}`);
        const g = m.name[3];                                        // g is game name
        if (!(g in game) || game[g].date>Date.now()+expired) {      // if new game or expired game,
            delete game[g];                                             // delete any expired game and create new game
            game[g] = {id:[w.id], date:Date.now(), name:m.name, show:m.show, turn:[]};
            w.game = g;                                                 // add game property to my object
        } else                                                      // otherwise,
            sendMsg(w.id, {op:"quit", name:g});                         // reject this createMsg
        return;                                                     // return
    }
    if (m.op=="join" && game && name && !("game" in w)) {       // if legal joinMsg and not in game,
        console.log(`(${w.game}.${w.id}) op:join, game:${m.game}, name:${m.name}`);
        if (m.game in game && game[m.game].name.includes(m.name)) { // if game exists and game includes name,
            const g = game[m.game];                                     // g references the game
            g.id.push(w.id);                                            // add id to the game
            w.game = m.game;                                            // set my game name property
            sendMsg(game[m.game].id[0], m);                             // send this message to the game's creator
            sendMsg(w.id, {op:"create", name:g.name, show:g.show});     // reply with createMsg 
        } else                                                      // otherwise,
            sendMsg(w.id, {op:"quit", name:m.name});                    // reject this create
        return;                                                     // return
    }
    if (m.op=="quit" && name) {                                 // if legal quitMsg and in game,
        console.log(`(${w.game}.${w.id}) op:quit, name:${m.name}`);
        if ("game" in w) {                                          // if in game,
            for (const id of game[w.game].id)                           // for each id associated with this game,
                if (id != w.id) {                                           // if the id isn't the quitter's id,
                    sendMsg(id, {op:"quit", name:m.name});                      // send a quitMsg
                    delete socket[id].game;                                     // delete the id's game property
                }
            delete game[w.game];                                        // delete the game
            delete w.game;                                              // delete the quitter's game property
        }
        return;                                                     // return
    }
    if (m.op=="deal" && value && "game" in w) {                // if legal dealMsg and in game,
        console.log(`(${w.game}.${w.id}) op:deal, value:[${m.value}]`);
        game[w.game].turn.push(m);                                  // add m to this game's turn array
        for (const id of game[w.game].id)                           // for each id associated with this game,
            sendMsg(id, {op:"pong", turn:game[w.game].turn});           // send a pongMsg
        return;                                                     // return
    }
    if (m.op=="bid" && bid && "game" in w) {                   // if legal bidMsg and in game,
        console.log(`(${w.game}.${w.id}) op:bid, bid:${m.bid}`);
        game[w.game].turn.push(m);                                  // add m to this game's turn array
        for (const id of game[w.game].id)                           // for each id associated with this game,
            sendMsg(id, {op:"pong", turn:game[w.game].turn});           // send a pongMsg
        return;                                                     // return
    }
    if (m.op=="declare" && suit && toss && "game" in w) {      // if legal declareMsg and in game,
        console.log(`(${w.game}.${w.id}) op:declare, suit:${m.suit}, toss:${m.toss}`);
        game[w.game].turn.push(m);                                  // add m to this game's turn array
        for (const id of game[w.game].id)                           // for each id associated with this game,
            sendMsg(id, {op:"pong", turn:game[w.game].turn});           // send a pongMsg
        return;                                                     // return
    }
    if (m.op=="play" && card && "game" in w) {                 // if legal playMsg and in game,
        console.log(`(${w.game}.${w.id}) op:play, card:${m.card}`);
        game[w.game].turn.push(m);                                  // add m to this game's turn array
        for (const id of game[w.game].id)                           // for each id associated with this game,
            sendMsg(id, {op:"pong", turn:game[w.game].turn});           // send a pongTurnMsg
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
    console.log(`websocket server listening to port: ${wssPort}`);
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

// Get local URLs
const nets = networkInterfaces();
for (const key of Object.keys(nets))
    for (const net of nets[key])
        if (net.family== 'IPv4' && !net.internal)
            console.log(`${key} URL: http://${net.address}:8080`);