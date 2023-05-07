const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const chattingUsers = new Map();

// Serve static files
app.use(express.static(__dirname + "/public"));

http.listen(3000, () => {
  console.log("listening on *:3000");
});

io.on("connection", (socket) => {
  console.log("----- A user joins the chat room -----");

  // Add a new user to the online user list when the user is connected
  chattingUsers.set(socket.id, { id: socket.id });

  // Send a welcome message to the new user
  socket.emit("chat status", "----- You join the chat room -----");

  // Broadcast a message to all other connected clients
  socket.broadcast.emit(
    "chat status",
    "----- A user has left the chat room -----"
  );

  // Listen for chat contents
  socket.on("chat content", (msg) => {
    console.log("message: " + msg);
    io.emit("chat content", msg); // Broadcast the message to all connected clients
  });

  // Handle user leave
  socket.on("user leave", (reason) => {
    console.log("user leave", reason);
    // Remove a user from the online user list when the user is disconnected
    chattingUsers.delete(socket.id);
    // Broadcast a message to all other connected clients
    socket.broadcast.emit(
      "chat status",
      "----- A user has left the chat room -----"
    );
  });

  // Processing requests to get a list of online users
  socket.on("get user list", () => {
    const userList = Array.from(chattingUsers.values());
    socket.emit("user list", userList);
  });

  socket.on("send user list", (message) => {
    socket.emit("chat content", message);
  });
});
