var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

class Server {

  constructor() {
    this.connectedCount = 0;
    this.clients = [];
    this.authClients = [];
  }

  connection(id, socket) {
    this.clients[id] = socket;
    this.connectedCount++;
    this.logConnectedCount();
  }

  disconnect(id) {
    delete this.clients[id];
    this.connectedCount--;
    this.logConnectedCount();
  }

  logConnectedCount() {
    console.log('%s socket(s) connected', this.connectedCount);
  }

}

var server = new Server;

io.on('connection', socket => {
  // add client on connection
  server.connection(socket.id, socket);
  

  socket.on('disconnect', () => {
    // remove client on disconnet
    server.disconnect(socket.id);
  });

	socket.on('user:connect', data => {
		
  });
  
  socket.on('user:posted', data => {
		socket.broadcast.emit('user:posted', data);
  });
  
  socket.on('user:bidded', data => {
		socket.broadcast.emit('user:bidded', data);
	});

});

io.listen(3000);
console.log('listening on *:3000');
