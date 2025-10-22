console.log("This is a console.log test");
console.debug("This is a console.debug test");
/*
const http = require('http');
http.createServer((req, res) => {
    console.debug(`createServer: ${req.url}`);
    if (req.url === '/events') {
        console.log(`createServer: ${req.url}`);
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*'  
        });
        setInterval(() => {
            res.write(`data: ${JSON.stringify({ time: new Date().toISOString() })}\n\n`);
        }, 1000);
    }
}).listen(8080);
console.debug("Server is up");
*/