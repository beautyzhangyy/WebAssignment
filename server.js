const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
// Store all user information
const chattingUsers = new Map();
app.use(express.static(__dirname + "/public"));

http.listen(3000, () => {
  console.log("listening on *:3000");
});

io.on("connection", (socket) => {
  console.log("----- A user joins the chat room -----");

  // Message received by a new user
  socket.emit("chat status", "----- You join the chat room -----");

  // Message received by other users after a new user is added
  socket.broadcast.emit(
    "chat status",
    "----- A user joins the chat room -----"
  );

  // Listening user is sending status message after input
  socket.on("chat status", (typeMessage) => {
    io.emit("chat status", typeMessage);
  });

  // A message is generated after the listener sends a message
  socket.on("chat content", (content) => {
    console.log("message: " + content);
    io.emit("chat content", content); // Broadcast the message to all connected clients
  });

  // The user list is generated after the chat interface is enabled
  const userList = Array.from(chattingUsers.values());
  socket.emit("create user list", userList);

  // Generate user list
  socket.on("user list", () => {
    const userList = Array.from(chattingUsers.values());
    io.emit("create user list", userList);
  });

  // Add information about a new user
  socket.on("add user list", (newName) => {
    chattingUsers.set(socket.id, { name: newName });
  });

  // Listen for the user to click away to leave the chat
  socket.on("user leave", (reason) => {
    console.log("user leave", reason);
    // Delete user information
    chattingUsers.delete(socket.id);
    // Send status information to other users
    socket.broadcast.emit(
      "chat status",
      "----- A user has left the chat room -----"
    );
  });

  // Listen for the user to close the page and leave the chat
  socket.on("disconnect", (reason) => {
    console.log("user leave", reason);
    // Delete user information
    chattingUsers.delete(socket.id);
    // Send status information to other users
    socket.broadcast.emit(
      "chat status",
      "----- A user has left the chat room -----"
    );
  });
});
