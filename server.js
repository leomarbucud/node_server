var app = require('express')();
app.set('port', process.env.PORT || 3000);
var cors = require('cors');

app.use(cors({ origin: 'https://dev.thegrid.com' }));
// Settings for CORS
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.header('Access-Control-Allow-Origin', 'https://dev.thegrid.com');

    // Request methods you wish to allow
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept-Type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.header('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

var _server = app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + _server.address().port);
});

var io = require('socket.io')(_server);

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

var server = new Server();

io.on('connection', socket => {
  // add client on connection
  server.connection(socket.id, socket);

  socket.on('disconnect', () => {
    // remove client on disconnet
    server.disconnect(socket.id);
  });

  // logged user
  socket.on('user:logged', data => {
    if(!data) return;
    // create room for individual user
    const user = data;
    console.log('logged in ', user.name);
    socket.join(user.id);
  })
  

	socket.on('user:connect', data => {
		if(!data) return;
  });
  
  socket.on('user:posted', data => {
    if(!data) return;
		socket.broadcast.emit('user:posted', data);
  });
  
  socket.on('user:bidded', data => {
    if(!data) return;
		socket.broadcast.emit('user:bidded', data);
  });
  
  socket.on('user:send_message', data => {
    if(!data) return;
    console.log('sending message to', data.recipient_id);
		io.sockets.in(data.recipient_id).emit('user:receive_message', data);
		io.sockets.in(data.author_id).emit('user:sent_message', data);
  });
  
  socket.on('user:create_conversation', data => {
    if(!data) return;
    var recipient_id = data.user_id_1;
    if( data.user_id_1 == data.last_updated_by ) {
      recipient_id = data.user_id_2;
    }
    io.sockets.in(recipient_id).emit('user:create_conversation', data);
  });

  socket.on('user:typing', data => {
    if(!data) return;
    console.log('user is typing...');
		io.sockets.in(data.recipient_id).emit('user:typing', data);
  });

});
