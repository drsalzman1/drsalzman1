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

// Websocket server
//
// Message:                                         Reply:                                              Members:
//     (connect)                                        op:"id", id:id
//     (close)                                          (none)                                              group reply
//     op:"ping"                                        op:"pong" 
//     op:"groups"                                      op:"groups", app:[""], group:[""], expire:[Date]
//     op:"group", gx:gx                                op:"group", gx:gx, member:[""] 
//     op:"create", app:"", group:"", expire:Date       op:"gx", gx:gx
//     op:"delete", gx:gx                               op:"delete", gx:gx                                  delete reply
//     op:"join", gx:gx, member:""                      op:"group", gx:gx, member:[""]                      group reply
//     op:"leave", gx:gx                                (none)                                              group reply
//     op:"update", gx:gx, json:""                      op:"json", gx:gx, json:""                           json reply
//     op:"recall", gx:gx                               op:"json", gx:gx, json:""

const wsPort = 3000;    // websocket server port = 3000
let id = 0;             // websocket identifier increments with each new websocket connection
const group = [];       // group[gx] = {app:"", group:"", expire:Date, member:[""], websocket:[websocket], json:""}

// Handle a websocket server's connection event
function wsConnect(websocket) {
    websocket.id = id;                                          // save websocket id
    websocket.onclose = wsClose;                                // prepare callbacks
    websocket.onmessage = wsMessage;
    websocket.send(JSON.stringify({                             // send id message to connector
        op:"id",
        id:id
    }));
    console.log(`websocket ${id} opened`);
    id++;                                                       // increment websocket id
}

// Handle a websocket's close event
function wsClose(closeEvent) {
    const websocket = closeEvent.target;                        // recall this websocket
    const id = websocket.id;                                    // recall this websocket id
    for (let gx = 0; gx < group.length; gx++)                   // for each member of each group,
    for (let mx = 0; mx < group[gx].member.length; mx++)
        if (group[gx].websocket[mx] == websocket) {                 // if their websocket is this websocket,
            group[gx].websocket[mx] = null;                             // leave a hole in place of their websocket
            for (let websocket of group[gx].websocket)                  // send group reply to remaining members
                if (websocket)
                    websocket.send(JSON.stringify({
                        op:"group", 
                        gx:gx, 
                        member:group[gx].member
                    }));
            break;
        }
    console.log(`websocket ${id} closed with code '${closeEvent.code}'`);
}

// Handle a websocket's message event
function wsMessage(messageEvent) {
    const message = JSON.parse(messageEvent.data);              // parse message from message event
    const websocket = messageEvent.target;                      // recall this websocket
    const id = websocket.id;                                    // recall this websocket id
    let gx = message.gx;                                        // extract group index, if any, from message
    let mx = 0;                                                 // define member index
    switch (message.op) {
        case "ping":                                            // if op:"ping",
            websocket.send(JSON.stringify({                         // send pong reply to sender
                op:"pong"
            }));
            //console.log(`websocket ${id} requested pong`);
            break;
        case "groups":                                          // if op:"groups",
            websocket.send(JSON.stringify({                         // send groups reply to sender
                op:"groups",
                app:group.app,
                group:group.group,
                expire:group.expire
            }));
            console.log(`websocket ${id} requested groups`);
            break;
        case "group":                                           // if op:"group", gx:gx,
            websocket.send(JSON.stringify({                         // send group reply to sender
                op:"group",
                gx:gx,
                member:group[gx].member
            }));
            console.log(`websocket ${id} requested group ${gx}`);
            break;
        case "create":                                          // if op:"create", app:"", group:"", expire:Date,
            gx = 0;                                                 // find first available group index (may be at end)
            while (group[gx] && Date.now()<group[gx].expire)
                gx++;
            group[gx] = {                                           // replace (or add) group record
                app:       message.app, 
                group:     message.group, 
                expire:    message.expire,
                member:    [],
                websocket: [],
                json:      ""
            };
            websocket.send(JSON.stringify({                         // send gx reply to sender
                op:"gx", 
                gx:gx
            }));
            console.log(`websocket ${id} created group ${gx}`);
            break;
        case "delete":                                          // if op:"delete", gx:gx,
            for (let websocket of group[gx].websocket)              // send delete reply to members
                if (websocket)
                    websocket[id].send(JSON.stringify({
                        op:"delete",
                        gx:gx
                    }));
            group[gx] = null;                                       // delete group record
            console.log(`websocket ${id} deleted group ${gx}`);
            break;
        case "join":                                            // if op:"join", gx:gx, member:"",
            mx = 0;                                                 // find first hole (end?) or matching member
            while (group[gx].member[mx] && group[gx].member[mx]!=message.member)
                mx++;
            group[gx].member[mx] = message.member;                  // add member to group
            group[gx].websocket[mx] = websocket;                    // add websocket to group
            for (let websocket of group[gx].websocket)              // send group reply to members
                if (websocket)
                    websocket.send(JSON.stringify({
                        op:"group", 
                        gx:gx, 
                        member:group[gx].member
                    }));
            console.log(`websocket ${id} joined group ${gx}`);
            break;
        case "leave":                                           // if op:"leave", gx:gx
            mx = 0;                                                 // find end or first matching websocket
            while (mx<group[gx].websocket.length && group[gx].websocket[mx]!=websocket)
                mx++;
            if (mx == group[gx].websocket.length)                   // if at end, quit
                return;
            group[gx].member[mx] = null;                            // delete member from group
            group[gx].websocket[mx] = null;                         // delete websocket from group
            for (let websocket of group[gx].websocket)              // send group reply to members
                if (websocket)
                    websocket.send(JSON.stringify({
                        op:"group", 
                        gx:gx, 
                        member:group[gx].member
                    }));
            console.log(`websocket ${id} left group ${gx}`);
            break;
        case "update":                                          // if op:"update", gx:gx, json:"",
            group[gx].json = message.json;                          // save new json
            for (let websocket of group[gx].websocket)              // send json reply to members
                if (websocket)
                    websocket.send(JSON.stringify({
                        op:"json", 
                        gx:gx, 
                        json:group[gx].json
                    }));
            console.log(`websocket ${id} updated group ${gx} json`);
            break;
        case "recall":                                          // if op:"recall", gx:gx
            websocket.send(JSON.stringify({                         // send json reply to sender
                op:"json", 
                gx:gx, 
                json:group[gx].json
            }));
            console.log(`websocket ${id} recalled group ${gx} json`);
            break;
        default:                                                // if op is unrecognized, log message
            console.log(`websocket ${id} received unrecognized message '${message}'`);
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