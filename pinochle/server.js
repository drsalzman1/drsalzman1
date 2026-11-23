import { createServer } from 'http';
import { readFile } from 'fs';
import { join, basename } from 'path';
import { lookup } from 'mime-types';
import { WebSocketServer } from 'ws';
import { networkInterfaces } from 'os';

// http sever constants
const hsPort = 8080;                                        // http server port

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

// Client message syntax (txed to server)                   Server action
// ======================================                   =============
const pingSyn   = '{"id":$,"ping":#}';                      // tx lost messages then tx pong
const loginSyn  = '{"id":$,"t":#,"login":$}';               // login then tx ins to awaiting
const groupSyn  = '{"id":$,"t":#,"group":[$]}';             // tx outs to old and ins to new
const logoutSyn = '{"id":$,"t":#,"logout":$}';              // tx outs to group then logout
const spreadSyn = '{"id":$,"t":#,...}';                     // tx modified message to group

// Server message syntax (txed to client)                   Client action
// ======================================                   =============
const pongSyn   = '{"id":$,"pong":#}';                      // tx lost messages then tx ping
const inSyn     = '{"id":$,"t":#,"in":$}';                  // start when all in
const playerSyn = '{"id":$,"t":#,"player":[$],"flag":[!]}'; // set up game
const dealSyn   = '{"id":$,"t":#,"deal":[#]}';              // deal cards
const bidSyn    = '{"id":$,"t":#,"bid":#}';                 // bid hand
const trumpSyn  = '{"id":$,"t":#,"trump":#,"toss":!}';      // pick trump and toss/play hand
const playOkSyn = '{"id":$,"t":#,"playOk":$}';              // play when all ok
const playSyn   = '{"id":$,"t":#,"play":#}';                // play card
const nextOkSyn = '{"id":$,"t":#,"nextOk":$}';              // deal next/logout when all ok
const outSyn    = '{"id":$,"t":#,"out":$}';                 // reload app

// Message semantics                                        Example
// =================                                        =======
// bid:    bid (0=pass)                                     bid:50
// deal:   [d]=suit+rank (0..19), d=play (0..79)            deal:[19,18,17,16,15,14,13,12,...]
// flag:   [0..3]=robot0..3, [4]=showCounts, [5]=showHands  flag:[false,true,true,true,tru...]
// group:  [g]=name of group member g                       group:['South','West','North',...]
// id:     client name ('' if none)                         id:'South'
// in:     name of player who logged in                     in:'South'
// login:  name of player who is logging in                 login:'South'
// logout: name of player who is logging out                logout:'South'
// nextOk: name of player ready for next deal or game       nextOk:'South'
// out:    name of player who logged out                    out:'South'
// ping:   number of messages received                      ping:0
// play:   0=p0c0, 1=p0c1, ...79=p3c19                      play:62
// playOk: name of player ready for play                    playOk:'South'
// player: [0]=maker, [1]=left, [2]=across, [3]=right       player:['South','West','North'...]
// pong:   number of messages received                      pong:0
// t:      number of messages transmitted                   t:0
// toss:   true=toss, false=play                            toss:true;
// trump:  0=diamonds, 5=clubs, 10=hearts, 15=spades        trump:0

// Syntax symbols: #=1+digits, $="0+legals", !=true|false, ...=0+chars, []=array
const digits    = '0123456789';
const legals    = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789' ";

// Server log value syntax
const valSyn = '{w:{id:$,...},group:[$],rxed:#,txed:#,txms:#,q:[$]}';

// Server log value semantics                               Example
// ==========================                               =======
// w:      client's websocket object or null                w:{id:'South',...}
// id:     client name                                      id:'South'
// group:  [g]=name of group member g                       group:['South','West','North',...]
// rxed:   number of messages received                      rxed:0
// txed:   number of messages transmitted                   txed:0
// txms:   milliseconds since epoch of latest transmission  txms:1795396113528
// q:      queue of stringified server messages             q:['{"in":"South"}']

// Server constants
const wssPort   = 3000;                                     // websocket server port
const log       = {};                                       // keys are client ids; values conform to valSyn
const pingTime  = 2000;                                     // milliseconds between pings (max)

// Return true if input string conforms to syntax string
function conforms(input='', syntax='') {
    let i = 0;                                                  // i is the current input index
    let s = 0;                                                  // s is the current syntax index
    let inArray = false;                                        // inArray is true between '[' and ']'
    while (i<input.length && s<syntax.length) {                 // while indices are within input and syntax;
        const i2 = input.slice(i, i+2);                             // i2 is next 2 input chars
        const i4 = input.slice(i, i+4);                             // i4 is next 4 input chars
        const i5 = input.slice(i, i+5);                             // i5 is next 5 input chars
        const s3 = input.slice(s, s+3);                             // s3 is next 3 syntax chars
        switch (syntax[s]) {                                        // if the syntax char...
        case '[':                                                   // ...signals start of array,
            if (i2=='[]' && (s3=='[#]' || s3=='[$]' || s3=='[!]')) {    // if input '[]' and syntax '[#]', '[$]' or '[!]',
                s += 3;                                                     // advance syntax index
                i += 2;                                                     // advance input index
                break;                                                      // accept and continue
            }
            if (input[i] != '[')                                        // if input char doesn't match the syntax char,
                return false;                                               // return false
            inArray = true;                                             // flag inArray
            s += 1;                                                     // advance syntax index
            i += 1;                                                     // advance input index
            break;
        case ']':                                                   // ...signals end of array
            if (input[i] != ']')                                        // if input char doesn't match the syntax char,
                return false;                                               // return false
            inArray = false;                                            // clear inArray and look for input match
            s += 1;                                                     // advance syntax index
            i += 1;                                                     // advance input index
            break;
        case '#':                                                   // ...is '#',
            if (!digits.includes(input[i]))                             // if first input char isn't a digit,
                return false;                                               // return false
            while (digits.includes(input[i]))                           // while input char is a digit,
                i += 1;                                                     // advance input index
            s += !inArray || input[i]!=','? 1 : 0;                      // if !inArray or input !comma, advance syntax index
            i += inArray && input[i]==','? 1 : 0;                       // if inArray and input comma, advance input index
            break;
        case '$':                                                   // ...is '$',
            if (input[i] != '"')                                        // if input char isn't '"',
                return false;                                               // return false
            i += 1;                                                     // advance input index
            while (legals.includes(input[i]))                           // while input char is a legal name char,
                i += 1;                                                     // advance input index
            if (input[i] != '"')                                        // if input char isn't '"',
                return false;                                               // return false
            i += 1;                                                     // advance input index
            s += !inArray || input[i]!=','? 1 : 0;                      // if !inArray or input !comma, advance syntax index
            i += inArray && input[i]==','? 1 : 0;                       // if inArray and input comma, advance input index
            break;
        case '!':                                                   // ...is '!',
            if (i4!='true' && i5!='false')                              // if input is invalid,
                return false;                                               // return false
            i += i4=='true'? 4 : 5;                                     // advance input index
            s += !inArray || input[i]!=','? 1 : 0;                      // if !inArray or input !comma, advance syntax index
            i += inArray && input[i]==','? 1 : 0;                       // if inArray and input comma, advance input index
            break;
        case '.':                                                   // ...is '.',
            s += 3;                                                     // advance syntax index to char beyond '...'
            while (i<input.length && input[i]!=syntax[s])               // while input char isn't char beyond '...',
                i += 1;                                                     // advance input index
            break;
        default:                                                    // otherwise,
            if (input[i] != syntax[s])                                  // if input doesn't match syntax,
                return false;                                               // return false
            s += 1;                                                     // advance syntax index
            i += 1;                                                     // advance input index
        }
    }
    return i==input.length && s==syntax.length;               // return true (all parsed) or false (not all parsed)
}

// Send client id message object m
function send(id, m) {
    const c = log[id];                                          // c is client object
    c.q.push(JSON.stringify({id:id, t:c.q.length, ...m}));      // add stringified message to client's queue
    if (c.w)                                                    // if client is online,
        for (let i=c.txed; c.txed<c.q.length; i++) {                // for each untxed message in client's queue,
            c.w.send(c.q[i]);                                           // tx untxed message
            c.txed++;                                                   // update txed counter
            c.txms=Date.now();                                          // update tx timer
        }
}

// Terminate websocket when ping not received in time
function pingTimerEvent(w) {
    console.log(`websocket ping timer event`);
    w.terminate();
}

// Handle a websocket's close event e when client disconnects
function wsClose(e) {
    const w = e.target;
    if (w.id && log[w.id])
        log[w.id].w = null;
    console.log(`${w.id} closed`);
    clearTimeout(w.pingTimer);
    w.pingTimer = w.onclose = w.onerror = w.onmessage = w.onopen = null;
    w.close();
}

// Handle a websocket's error event e (doesn't seem to happen)
function wsError(e) {
    const w = e.target;
    console.error(`${w.id} erred`);
}

// Handle a websocket's message event e when client sends sends e.data
function wsMessage(e) {
    const w = e.target;                                         // w is the client websocket
    let logged = false;                                         // client message not yet logged

    // Ignore message if it won't parse
    try {JSON.parse(e.data)} catch(error) {
        note(`ignored (caught:${error.name}, detail:${error.message})`, true);
        return;
    }

    // Ignore message if it won't parse to a simple object
    const m = JSON.parse(e.data);                               // m is the message object
    if (typeof m!='object' || m=='null' || Array.isArray(m)) {
        note(`ignored (not object)`, true);
        return;
    }

    // Ignore message if it doesn't have an id
    const id = m.id;                                            // id is the client name
    if (typeof id != 'string') {
        note(`ignored (missing id)`, true)
        return;
    }

    // Handle ping message while logged out
    if (conforms(e.data, pingSyn) && !(id in log)) {            // if ping message while logged out,
        w.pingTimer.refresh();                                      // refresh ping timer
        w.send(JSON.stringify({id:'', pong:0}));                    // send anonymous pong message
        //note(`sent anonymous pong message`);                        // note action taken
        return;                                                     // return
    }

    // Handle login message while logged out
    if (conforms(e.data, loginSyn) && !(id in log)) {           // if login message while logged out,
        log[id] = {w:w,group:[],rxed:m.t+1,txed:0,txms:0,q:[]};     // log in id
        w.id = id;                                                  // store id for wsClose
        const u = [];                                               // clear list
        for (const usr in log)                                          // for each user,
            if (log[usr].group.includes(id)) {                              // if user's group includes id,
                u.push(usr);                                                // add to list
                send(usr, {in:id});                                         // send id in message to member
            }
        note(`${u.length?`sent in:${id} to [${u}]`:`no sends`}`);   // note action    
        return;                                                     // return
    }

    // Ignore message if not logged in
    const c = log[id];                                          // c is the client object
    if (!(id in log)) {
        note(`ignored (${id} not logged in)`);
        return;
    }

    // Set websocket if websocket was closed
    if (c.w == null) {
        note(`reconnected ${id}`);
        c.w = w;
        w.id = id;
    }

    // Set websocket if websocket changed
    if (c.w != w) {
        note(`hijacked ${id}`);
        c.w = w;
        w.id = id;
    }

    // Handle ping message (while logged in)
    if (conforms(e.data, pingSyn)) {                            // if ping message,
        w.pingTimer.refresh();                                      // refresh pingTimer
        if (m.ping > c.txed) {                                      // if client rxed more than txed,
            note(`advanced (txed:${c.txed})`);                          // note action taken
            c.q.length = c.txed = m.ping;                               // advance queue and txed to match rxed
        }
        if (c.txed>m.ping && Date.now()>c.txms+pingTime)        // if more txed than rxed and enough time has elapsed,
            for (let i=m.ping; i<c.txed; i++) {                     // for every unrxed message that was txed,
                note(`resent ${c.q[i].slice(0,100)}`);                  // note action taken
                w.send(c.q[i]);                                         // resend unrxed message
            }
        w.send(JSON.stringify({id:id, pong:c.rxed}));           // send proper pong message
        //note(`ponged ${JSON.stringify({id:'id',pong:c.rxed})}`); // note action taken
        return;                                                 // return
    }

    // Ignore message if txed more than rxed to allow clients to resend lost messages
    if (m.t > c.rxed) {
        note(`ignored (rxed:${c.rxed})`);
        return;
    }

    // Rewind rxed if rxed more than txed
    if (c.rxed > m.t) {
        note(`rewound (c.rxed:${c.rxed})`);
        c.rxed = m.t;
    }

    // Increment rxed to prepare for next incoming message
    c.rxed++;

    // Ignore login message while logged in
    if (conforms(e.data, loginSyn)) {
        note(`ignored (already logged in)`);
        return;
    }

    // Handle group message while logged in
    if (conforms(e.data, groupSyn)) {                           // if group message,
        const outs = [];                                            // start list
        for (const mbr of c.group)                                  // for each member of old group,
            if (mbr!=id && !m.group.includes(mbr) && log[mbr]) {        // if not self, not in new group and logged in,
                outs.push(mbr);                                             // add to list
                send(mbr, {out:id});                                        // send id out message to old member
            }
        const ins = [];                                             // start list
        for (const mbr of m.group)                                  // for each member of new group,
            if (mbr!=id && !c.group.includes(mbr) && log[mbr]) {        // if not self, not in old group, and logged in,
                ins.push(mbr);                                              // add to list
                send(mbr, {in:id});                                         // send id in message to new member
                send(id, {in:mbr});                                         // send member in message to id
            }
        c.group.splice(0, c.group.length, ...m.group);              // replace old group with new group
        const out$ = outs.length? `sent out:${id} to [${outs}]; ` : '';
        const in$ = ins.length? `sent in:${id} to [${ins}]; sent in:[${ins}] to ${id}` : '';
        note(`${out$+in$==''? 'no sends' : out$+in$}`);             // note action taken
        return;                                                     // return
    }

    // Handle logout message while logged in
    if (conforms(e.data, logoutSyn)) {                          // if logout message,
        const l = [];                                               // clear list
        for (const mbr of c.group) {                                // for each member of group,
            if (mbr!=id && log[mbr]) {                                  // if not self and logged in,
                l.push(mbr);                                                // add to list
                send(mbr, {out:id});                                        // send id out message to member
            }
        }
        delete log[id];                                             // log out
        note(`${l.length?`sent out:${id} to [${l}]`:'no sends'}`);  // note action taken
        return;                                                     // return;
    }

    // Handle spread message, including malformed, while logged in
    if (conforms(e.data, spreadSyn)) {                           // if other message,
        const l = [];                                               // clear list
        for (const mbr of c.group) {                                // for each member of group,
            if (mbr!=id && log[mbr]) {                                  // if not self and logged in,
                l.push(mbr);                                                // add to list
                delete m.id;                                                // delete message's id
                delete m.t;                                                 // delete message's t
                send(mbr, m);                                               // send message to member
            }
        }
        note(`${l.length?`sent message to [${l}]`:'no sends'}`);    // note action taken
        return;                                                     // return
    }

    // Reject unrecognized messages
    note(`ignored (unrecognized)`, true);
    return;

    // Note server message (one time) and action taken (if any)
    function note(action, error=false) {
        if (!logged)
            console.log(e.data.slice(0,100));
        if (action && !error)
            console.log(`-- ${action}`);
        if (action && error)
            console.error(`-- ${action}`);
        logged = true;
    }
}

// Handle a websocket's open event e (doesn't seem to happen)
function wsOpen(e) {
    const w = e.target;
    console.log(`${w.id} opened`);
}

//----------------------------------------- Web Socket Server Functions --------------------------------------------------

// Handle the websocket server's close event e (doesn't seem to happen)
function wssClose() {
    console.log(`websocket server closed`);
}

// Handle a websocket server's connection event for websocket w and request r
function wssConnection(w, r) {
    w.onclose = wsClose;
    w.onerror = wsError;
    w.onmessage = wsMessage;
    w.onopen = wsOpen;
    w.pingTimer = setTimeout(pingTimerEvent, pingTime, w);
    console.log(`websocket connected`);
}

// Handle the websocket server's error event e (doesn't seem to happen)
function wssError() {
    console.error(`websocket server error`);
}

// Ignore the websocket server's headers event (happens for every connection)
function wssHeaders(headers, request) {
}

// Handle the websocket server's listening event (happens once per server restart)
function wssListening() {
    console.log(`websocket server listening to port: ${wssPort}`);
}

// Handle the websocket server's wsClientError event (doesn't seem to happen)
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
for (const id of Object.keys(nets))
    for (const net of nets[id])
        if (net.family=='IPv4' && !net.internal)
            console.log(`${id} URL: http://${net.address}:8080`);