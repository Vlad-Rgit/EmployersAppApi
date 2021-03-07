
const ws = require('ws')
const wsUser = require('./user');
const wsChat = require('./messages');
const jwt = require('../utils/jwt')
const url = require('url');
const { path } = require('./user');


function route(request, socket, head) {
    const pathname = url.parse(request.url).pathname;
    console.log(pathname);
    if(pathname === '/user') {
        wsUser.handleUpgrade(request, socket, head, (ws) => {
            wsUser.emit("connection", ws, request);
        });
    }
    else if(pathname === '/chat') {
        wsChat.handleUpgrade(request, socket, head, (ws) => {
            wsChat.emit('connection', ws, request);
        })
    }
}

module.exports.init = function(httpServer) {
    
    httpServer.on('upgrade', (request, socket, head) => {
        const authHeader = request.headers["authorization"];
        const token = authHeader.split(' ')[1];
        jwt.verify(token, (err, payload) => {
            if(err) {
                socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
                socket.destroy();
            }
            else {
                route(request, socket, head);
            }
        })
    });

    console.log("Web socket initialized!");
}