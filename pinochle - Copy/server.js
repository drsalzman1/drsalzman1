import { createServer } from 'http';
import { readFile } from 'fs';
import { join, basename } from 'path';
import { lookup } from 'mime-types';
import { WebSocketServer } from 'ws';
import { networkInterfaces } from 'os';

//---------------------------------------- http Server Functions ---------------------------------------------------------

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

// -------------------------------------- Websocket Protocol ----------------------------------
//
// Client Message                                       Server Action
// ==============                                       =============
// {src:str, smr:int} (aka ping)                        reply with any queued msgs and pong
// {src:str, smr:int, dst:[str], cmt:int, msg:obj}      forward, queue or discard 
//
// Server Message                                       Client Action
// ==============                                       =============
// {cmr:int} (aka pong)                                 reply with any queued msgs and ping
// {cmr:int, smt:int, msg:obj}                          discard or process msg
//
// App Msg                                              Client Action
// =======                                              =============
// {player:[str], robot:[bln], show:[bln]}              set up game
// {play:str}                                           play game, if dealer
// {hand:[int]}                                         deal hand
// {bid:integer}                                        post bid
// {trump:int, toss:bln}                                pick trump and toss/play hand
// {lead:str}                                           lead card, if bid winner
// {card:int}                                           play card
// {deal:str}                                           deal next hand, if dealer
// {quit:str}                                           quit game
//
// Key:Value                                            Example
// =========                                            =======
// bid:    bid (0=pass)                                 bid:50
// card:   0=left's card0, ...79=maker's card19         card:62
// cmr:    client appMsgs received by server            cmr:0
// cmt:    client appMsgs transmitted by client         cmt:0
// deal:   name of player ready for next deal           deal:'Grampy'
// dst:    [n]=remote player n's name                   dst:['Grammy','Grampy']
// exp:    expiration date of unsocketed entry          exp:1784301482813
// hand:   [card] 0=JD, 1=QD, 2=KD, 3=TD, 4=AD, 19=AS   hand:[0,0,0,0,1,1,1,1, ...19,19,19,19]
// lead:   name of player ready for next lead card      lead:'Grampy'
// msg:    appMsg                                       msg:{ready:'Grampy'}
// player: [0]=left, [1]=across, [2]=right, [3]=maker   player:['West','North','East','South']
// play:   name of player ready to play game            play:'Grampy'
// q:      [0]=1st unackd msg, [1]=2nd unackd msg, ...  q:[{deal:'Grampy'}]
// quit:   name of quitter                              quit:'Grammy'
// robot:  [0]=left's a robot, ...[3]=maker's a robot   robot:[true,true,true,false]
// show:   [0]=showCounts, [1]=showHands                show:[true,false]
// smr:    server appMsgs received by client            smr:0
// smt:    server appMsgs transmitted by client         smt:0
// src:    local player name                            src:'Grampy'
// toss:   true=toss, false=play                        toss:true;
// trump:  0=diamonds, 5=clubs, 10=hearts, 15=spades    trump:0
// ws:     websocket                                    ws:{name:'Bob', ...}

const wssPort = 3000;                                   // websocket server port
const reg = {};                                         // {dst1:{ws:o,exp:i,cmr:i,smt:i,q:[o]}}
const hr = 60*60*1000;                                  // one hour in milliseconds

//------------------------------------------ Value Test Functions --------------------------------------------------------

// Return true if b is a boolean
function bo(b) {
    return typeof b=='boolean';
}

// Return true if a is an array of boolean
function ab(a) {
    return typeof a=='object' && Array.isArray(a) && a.every(b => typeof b=='boolean');
}

// Return true if s is a full (non-empty) string
function fs(s) {
    return typeof s=='string' && s!='';
}

// Return true if a is an array of full (non-empty) strings
function af(a) {
    return typeof a=='object' && Array.isArray(a) && a.every(s => typeof s=='string' && s!='');
}

// Return true if i is a positive (>=0) integer
function pi(i) {
    return typeof i=='number' && Number.isInteger(i) && i>=0;
}

// Return true if a is an array of positive (>=0) integers
function ap(a) {
    return typeof a=='object' && Array.isArray(a) && a.every(i => Number.isInteger(i) && i>=0);
}

// Return true if o is a simple (non-null, non-array) object
function so(o) {
    return typeof o=='object' && o!='null' && !Array.isArray(o);
}

// Return number of keys in simple object (or 0)
function keys(o) {
    return so(o)? Object.keys(o).length : 0;
}

//----------------------------------------- Websocket Functions ----------------------------------------------------------

// Handle a websocket's close event e
function wsClose(e) {
    const w = e.target;                                         // w is this websocket
    console.log(`${w.name} closed`);                            // name may be undefined
    if (w.name in reg) {                                        // if this websocket is registered,
        reg[w.name].ws = null;                                      // dereference websocket
        reg[w.name].exp = Date.now() + hr;                          // await reconnection for one hour
    }
    w.onclose = null;                                           // dereference onclose
    w.onerror = null;                                           // dereference onerror
    w.onmessage = null;                                         // dereference onmessage
    w.onopen = null;                                            // dereference onopen
    delete w.name;                                              // delete this websocket's name
}

// Handle a websocket's error event e
function wsError(e) {
    console.error(`${e.target.name} erred`);                    // name may be undefined
}

// Handle a websocket's message event e where e.target is the websocket and e.data is the message
function wsMessage(e) {
    const w = e.target;                                         // w is the client's websocket
    try {JSON.parse(e.data)}                                    // try to parse event data
    catch(error) {                                              // if parse fails, log error and return
        console.error(`${w.name} caught:${error.name}, detail:${error.message}, data:${e.data}`);
        return;
    }
    const m = JSON.parse(e.data);                               // m is the client message object
    let logged = false;                                         // client message not yet logged
    if ('name' in w && fs(m.src) && w.name!=m.src) {            // if websocket's name is changing,
        console.log(`${w.name}: ${e.data.slice(0,100)}`);           // log (truncated?) client message
        logged = true;                                              // note client message logged
        console.log(`-- deleted ${w.name} (renamed)`);              // log response
        delete reg[w.name];                                         // unregister old name
        delete w.name;                                              // delete websocket's old name
    }
    if (!('name' in w) && fs(m.src)) {                          // if client's websocket is unnamed and src in m,
        if (!logged)                                                // if client message not let logged,
            console.log(`${w.name}: ${e.data.slice(0,100)}`);           // log (truncated?) client message
        logged = true;                                              // note client message logged
        if (!reg[m.src]) {                                          // if name isn't registered,
            console.log(`-- created ${m.src} (unregistered)`);          // log response
            reg[m.src] = {ws:w, exp:0, cmr:0, smt:0, q:[]};             // create a new registry entry
        } else if (reg[m.src].ws) {                                 // otherwise, if registered name already has a client                                    
            console.log(`-- ignored (${m.src} (already active)`);       // log (non)response
            return;                                                     // return
        } else if (Date.now() > reg[m.src].exp) {                   // otherwise, if the old entry has expired,
            console.log(`-- reset ${m.src} (expired)`);                 // log response
            reg[m.src] = {ws:w, exp:0, cmr:0, smt:0, q:[]};             // reset the expired registry entry
        } else {                                                    // otherwise (registered, no client, not expired),
            console.log(`-- reactivated ${m.src}`);                     // log response
            reg[m.src].ws = w;                                          // update the existing registry entry
        }
        w.name = m.src;                                             // name client's websocket
    }
    if (fs(m.src) && pi(m.smr)) {                               // if may need to mess with resend queue,
        const r = reg[m.src];                                       // r is this websocket's registry entry
        if (!logged && m.smr!=r.smt) {                              // if client message not yet logged, yet worth logging,
            console.log(`${w.name}: ${e.data.slice(0,100)}`);           // log (truncated?) client message
            logged = true;                                              // note client message logged
        }
        if (m.smr == r.smt) {                                       // if client received all server appMsgs txed,
            //console.log(`-- ackd ${r.q.length} queued msgs`);         // log (non)response
            r.q.length = 0;                                             // clear resend queue (all ackd)
        } else if (r.q.length && r.smt-m.smr<=r.q.length) {         // otherwise, if client didn't rx all queued msgs,
            let t = m.smr;                                              // start server msgs txed at server msgs rxed
            let i = r.q.length - (r.smt - m.smr);                       // i is the q index
            while (t < r.smt) {                                         // while server msgs txed < client msgs rxed,
                const s = {cmr:r.cmr, smt:t++, msg:r.q[i++]};               // s is server message
                w.send(JSON.stringify(s));                                  // resend server message to dst
                console.log(`-- resent ${JSON.stringify(s).slice(0,100)}`); // log resent appMsg
            }
        } else {                                                    // otherwise,
            console.log(`-- resynced (smt:${r.smt}, q.length:${r.q.length})`); // log smr response
            r.smt = m.smr;                                              // assume client is correct
            r.q.length = 0;                                             // clear resend queue
        }
    }
    if (keys(m)==2 && fs(m.src) && pi(m.smr)) {                 // if pingMsg,
        const r = reg[m.src];                                       // r is this websocket's registry entry
        w.send(JSON.stringify({cmr:r.cmr}));                        // reply with pongMsg
        if (logged)                                                 // if pingMsg logged,
            console.log(`-- replied {cmr:${r.cmr}}`);                   // log pingMsg response
        return;                                                     // return
    }
    if (fs(m.src)&&pi(m.smr)&&af(m.dst)&&pi(m.cmt)&&so(m.msg)){ // if appMsg,
        if (!logged)                                                // if appMsg not yet logged,
            console.log(`${w.name}: ${e.data.slice(0,100)}`);           // log (truncated?) appMsg
        if (m.cmt == 0) {                                           // if this is the client's first appMsg,
            reg[m.src].cmr = 0;                                         // reset the client appMsgs rxed count
            reg[m.src].smt = 0;                                         // reset the server appMsgs txed count
            reg[m.src].q.length = 0;                                    // reset the client appMsg resend queue
            console.log(`-- reset ${m.src} (first)`);                   // log appMsg response
        }
        if (m.cmt == reg[m.src].cmr) {                              // if the appMsg is in sequence,
            reg[m.src].cmr++;                                           // note that server received the appMsg
            for (const d of m.dst) {                                    // for the appMsg's every dst,
                if (!(d in reg)) {                                          // if the dst is unregistered,
                    reg[d] = {ws:null, exp:Date.now()+hr, cmr:0, smt:0, q:[]};  // allow registration for one hour
                    console.log(`-- created ${d}`);                             // log appMsg response
                }
                if (reg[d].ws) {                                            // if the dst has a websocket,
                    const s = {cmr:reg[d].cmr, smt:reg[d].smt++, msg:m.msg};    // build server message
                    reg[d].ws.send(JSON.stringify(s));                          // send server message to dst
                    //console.log(`-- ${d}: ${JSON.stringify(s).slice(0,100)}`);  // log appMsg response
                }
                reg[d].q.push(m.msg);                                       // add the msg to the dst's resend queue
            }
        } else                                                      // otherwise (out of sequence),
            console.log(`-- discarded (out-of-sequence)`);              // log appMsg (non)response
        return;                                                     // return
    }
    console.error(`${w.name}: ${e.data.slice(0,100)}`);         // log (truncated?) unrecognized message
    console.error(`-- discarded (unrecognized)`);               // log unrecognized response
}

// Handle a websocket's open event e
function wsOpen(e) {
    console.log(`${e.target.name} opened`);                     // should be undefined
}

//----------------------------------------- Web Socket Server Functions --------------------------------------------------

// Handle the websocket server's close event e
function wssClose() {
    console.log(`websocket server closed`);
}

// Handle a websocket server's connection event for websocket w and request r (w.name is undefined)
function wssConnection(w, r) {
    w.onclose = wsClose;
    w.onerror = wsError;
    w.onmessage = wsMessage;
    w.onopen = wsOpen;
    console.log(`websocket server connection event`);
}

// Handle the websocket server's close event
function wssError() {
    console.error(`websocket server error`);
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
    console.error(`websocket server client error`);
}

// Initialize websocket server
const wss = new WebSocketServer({port:wssPort});
wss.on('close', wssClose);
wss.on('connection', wssConnection);
wss.on('error', wssError);
wss.on('headers', wssHeaders);
wss.on('listening', wssListening);
wss.on('wsClientError', wssWsClientError);

//----------------------------------------- Initialization Code ----------------------------------------------------------

// Get local URLs
const nets = networkInterfaces();
for (const key of Object.keys(nets))
    for (const net of nets[key])
        if (net.family=='IPv4' && !net.internal)
            console.log(`${key} URL: http://${net.address}:8080`);