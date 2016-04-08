'use strict';

// Import Modules =========================================================================
var express    = require('express');
var app        = require('express')();
var http       = require('http');
var httpServer = http.createServer(app);
var io         = require('socket.io')(httpServer);

// Set static files =========================================================================
app.use(express.static(__dirname + '/public'));

// Routes ===================================================================================
require('./app/routes.js')(app);

var connectedSockets = {}; // List of sockets = list of users
var allUsers = [{nickname : ""}];//初始值即包含"群聊",用""表示nickname

io.on('connection', function(socket){

    // Receive 'addUser' events. It means a new user enters chat room
    socket.on('addUser', function(data){

        if(connectedSockets[data.nickname]){

            // If nickname already exists. Send false result to client side
            socket.emit('userAddingResult',{ result : false });

        }else{

            socket.emit('userAddingResult',{ result : true });

            socket.nickname = data.nickname;

            // Store new user in connectedSockets and allUsers
            connectedSockets[socket.nickname] = socket;
            allUsers.push(data);

            // Broadcast to all stocks that a new user entering
            socket.broadcast.emit('userAdded', data);

            // Emit all current users info to new user
            socket.emit('allUser', allUsers);
        }
    });

    // Receive 'addMessage' events. It means a new message sent by someone
    socket.on('addMessage', function(data){

        if(data.to){

            // If it's a message to specified user
            connectedSockets[data.to].emit('messageAdded', data);

        }else{

            // If not, it's a message to all users
            socket.broadcast.emit('messageAdded',data);
        }
    });

    // Receive 'disconnect' events. It means user quits chat room
    socket.on('disconnect', function () {

            // Broadcast to all users that given user quits chat room
            socket.broadcast.emit('userRemoved', {
                nickname: socket.nickname
            });

            // Remove from allUsers list
            for(var i = 0; i < allUsers.length; i++){
                if(allUsers[i].nickname == socket.nickname){
                    allUsers.splice(i,1);
                }
            }

            // Remove from connectedSockets
            delete connectedSockets[socket.nickname];
        }
    );
});

http.listen(3000, function () {
    console.log('listening is on port 3000 !');
});