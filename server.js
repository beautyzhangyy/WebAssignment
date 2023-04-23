const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

// Serve static files
app.use(express.static(__dirname + '/public'));
io.on('connection', (socket) => {
});
http.listen(3000, () => {
    console.log('listening on *:3000');
  });
  