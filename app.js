var express = require('express');
var app = express();
var serv = require('http').Server(app);

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/client/index.html');
});

app.use('/client', express.static(__dirname + '/client'));

serv.listen(8080);

console.log("server started.");

var io = require('socket.io')(serv, {});

var SOCKET_LIST = {};
var FPS = 60;

io.sockets.on('connection', function(socket) {
    console.log('new socket connection');
    // Generate ID
    var id = 0;
    var unique = false;
    while (!unique) {
        id = Math.random();
        unique = true;
        for (var i in SOCKET_LIST) {
            if (SOCKET_LIST[i].id == id) {
                unique = false;
                break;
            }
        }
    }
    socket.id = id;

    // Attributes
    socket.state = -1;

    // Add socket
    SOCKET_LIST[socket.id] = socket;

    // When player disconnects
    socket.on('disconnect', function() {
      console.log('socket disconnection');
        delete SOCKET_LIST[socket.id];
    });
});

// Main game loop
setInterval(function() {
    // Send data to client
    for (var i in SOCKET_LIST) {
        // Calculations
        var socket = SOCKET_LIST[i];
        //console.log(circles)
        socket.emit(
            'update', {
                state: socket.state
            });
    }
}, 1000 / FPS);
