import { createServer } from 'http';
import { readFile } from 'fs';
import { join } from 'path';
import { lookup } from 'mime-types';
import { WebSocketServer } from 'ws';

//-------------------- http server ---------------------------

const hsPort = 8080;

// Handle http server's request event's request and response
function hsRequest(request, response) {

    // Handle readFile's callback's error and content
    function readFileCallback(error, content) {
        if (error) {
            response.writeHead(404, {'Content-Type': 'text/html'});
            response.end();
        } else {
            response.writeHead(200, {'Content-Type': lookup(filePath)});
            response.end(content, 'utf-8');
        }
    }

    // Handle http server's request event's request and response
    const filePath = join(import.meta.dirname, request.url=='/'?'index.html':request.url);
    readFile(filePath, readFileCallback);
}

function hsListening() {
    console.log(`http server listening to port ${hsPort}`);
}

// initialize http server
const hs = createServer(hsRequest); // adds hsRequest to http server's request event listener
hs.listen(hsPort, hsListening);

//--------------------- websocket server -----------------------

// websocket port
const wsPort = 3000;

// websocketList[id] is the websocket for websocket id
const websocketList = [];

// Handle websocket server's close event
function wsClose() {
    console.log(`websocket server closed`);
}

// Handle the websocket server's connection event's websocket and request
function wsConnection(websocket, request) {

    // Log the current non-empty websocketList indices
    function logList(text) {
        text += " -- the list is now";
        for (let id = 0; id < websocketList.length; id++)
            if (websocketList[id] != null && websocketList[id] != undefined)
                text += " " + id + ",";
        if (text.endsWith(","))
            text = text.slice(0, -1);
        if (text.endsWith("now"))
            text += " empty";
        console.log(text);
    }

    // Handle websocket id's close event's code and reason
    function close(code, reason) {
        websocketList[id] = null;                                               // clear this websocket from list
        logList(`websocket ${id} closed with code '${code}'`);
    }

    // Handle websocket id's error event's error.code
    function error(error) {
        console.log(`websocket ${id} erred with error.code '${error.code}'`);
    }

    // Handle websocket id's message event's data and isBinary
    function message(data, isBinary) {
        let msg = data.toString();                                              // convert buffer to string
        msg = JSON.parse(data);                                                 // parse msg from data
        if (msg.id!= id)                                                        // if wrong id, log error
            console.error(`message id ${msg.id} != websocket id ${id}`);
        if (websocketList[id] != websocket)
            console.error(`websocket ${id} rxed '${msg}' with websocketList[${id}==${websocketList[id]}`);
        if (msg.op == "ping")                                                   // if op is ping, send pong
            websocket.send(`{"op":"pong", "id":"${id}"}`);
        else                                                                    // otherwise, log msg and isBinary
            console.log(`websocket ${id} rxed '${msg}' with isBinary '${isBinary}'`);
    }

    // Handle websocket id's open event
    function open() {
        console.log(`websocket ${id} opened`);
    }

    // Handle websocket id's ping event's buffer
    function ping(buffer) {
        console.log(`websocket ${id} pinged with buffer '${buffer}'`);
    }

    // Handle websocket id's pong event's buffer
    function pong(buffer) {
        console.log(`websocket ${id} ponged with buffer '${buffer}'`);
    }

    // Handle websocket id's redirect event's url and request
    function redirect(url, request) {
        console.log(`websocket ${id} redirected with url '${url}' and request '${request}'`);
    }

    // Handle websocket id's unexpected-response event's response to request
    function unexpectedResponse(request, response) {
        console.log(`websocket ${id} received an unexpected response '${response}' to request '${request}'`);
    }

    // Handle websocket id's upgraded event's response
    function upgraded(response) {
        console.log(`websocket ${id} upgraded with response '${response}'`);
    }

    // Handle the websocket server's connection event's websocket and request where request.url should be `/${id}`
    let id = Number.parseInt(request.url.substring(1));                         // get id from request (-1 if TBD)
    if (id < 0)                                                                 // if id < 0, use first unused list index
        id = websocketList.findIndex((ws)=>{return ws==null||ws==undefined});
    if (id < 0)                                                                 // if no unused indices, use next index
        id = websocketList.length;
    websocketList[id] = websocket;                                              // save this websocket in list
    websocket.send(`{"op":"assign", "id":"${id}"}`);                            // assign id to client for reconnect
    logList(`websocket ${id} opened`);
    websocket.on('close', close);
    websocket.on('error', error);
    websocket.on('message', message);
    websocket.on('open', open);
    websocket.on('ping', ping);
    websocket.on('pong', pong);
    websocket.on('redirect', redirect);
    websocket.on('unexpected-response', unexpectedResponse);
    websocket.on('upgrade', upgraded);
}

// Handle websocket server's error event's error.code
function wsError(error) {
    console.log(`websocket server error.code '${error.code}'`);
}

// Handle websocket server's headers event's headers and request
function wsHeaders(headers, request) {
}

// Handle websocket server's listening event
function wsListening() {
    console.log(`websocket server listening to port ${wsPort}`);
}

// Handle websocket wsClientError's listening event's error, socket and request
function wsClientError(error, socket, request) {
    console.log(`websocket server wsClientError with error.code '${error.code}, socket '${socket}', request '${request}'`);
}

// Initialize websocket server
const ws = new WebSocketServer({port:wsPort});
ws.on('close', wsClose);
ws.on('connection', wsConnection);
ws.on('error', wsError);
ws.on('headers', wsHeaders);
ws.on('listening', wsListening);
ws.on('wsClientErred', wsClientError);