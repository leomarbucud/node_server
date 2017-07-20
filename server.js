var fs = require('fs');
var options = {
    key: fs.readFileSync('/vagrant/dev.thegrid.com.pem'),
    cert: fs.readFileSync('/vagrant/dev.thegrid.com.pem'),
    requestCert: true
};
var app = require('express')();
var http = require('http').Server(app);
var https = require('https').Server(options, app);
var http2 = require('http');
var io = require('socket.io')(http);//, {origins: 'thegrid.com:* https://dev.thegrid.com:* https://thegrid.com:*'});



//io.set('authorization', function (handshakeData, callback) {
  // var token = handshakeData.query.token;
  //will call callback(null, true) if authorized
  // checkAuthToken(token, callback);
//});

// var server = http2.createServer(function (request, response) {
//   response.writeHead(200, {"Content-Type": "text/plain"});
//   response.end("Hello World\n");
// 	console.log('entered');
// });

// Listen on port 8000, IP defaults to 127.0.0.1
// server.listen(8080);


var sockets = [];
var users = [];

io.on('connection', function(socket){
	sockets.push(socket);
	console.log('%s socket(s) connected', sockets.length);

	socket.on('new-user', function(data) {
		console.log('new user is connected', data);
    if(data.user) {
      var room = data.user.id;
      socket.join(room);
      io.sockets.in(room).emit('user-callback', data.user_id);
    }
	});

	socket.on('disconnect', function (socket) {

		console.log('A user disconnected');
	});

	socket.on('google-map-dragend', function(data) {
		console.log(data);
		socket.broadcast.emit('set-map', data);
	});

	socket.on('new-job', function(data) {
		console.log('new job', data);
		socket.broadcast.emit('add-marker', data);
		//var job_room = 'JOB_' + data.job_id;
		//socket.join(job_room);
	});

	socket.on('new-bid', function(data) {
		console.log('new bid', data);
		// socket.broadcast.emit('add-bid', data);
		var room = data.job.user_id;
		if(room) {
			io.sockets.in(room).emit('add-bid', data);
			io.sockets.in('JOB_' + data.job.id).emit('new-bidder', data);
		}
	});

	socket.on('approve-bid', function(data) {
		console.log('approve bid', data);
		var room = data.user_id;
		if(room) {
			io.sockets.in(room).emit('approve-bid', data);
			console.log('only_bids', data.job.only_bids);
			io.sockets.in('JOB_'+data.job.id).emit('testing', data);
		}
	});

	// join job room
	socket.on('join-room', function(data) {
		if(data) {
			console.log('joining to ' + data);
			socket.join(data);
		}
	});

	socket.on('emit-to', function(room) {
		io.sockets.in(room).emit('user-callback', room);
	});

	socket.on('new-message', function(data) {
		if(data.recipient_id) {
			io.sockets.in(data.recipient_id).emit('receive-message', data);
		}
	});

	socket.on('typing', function(data) {
		if(data.recipient_id) {
			io.sockets.in(data.recipient_id).emit('sender-typing', data);
			console.log('typing', data);
		}
	});

});

io.listen(3000);
console.log('listening on *:3000');
