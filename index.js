const express = require("express");
const app = express();
const http = require("http");
require("dotenv").config();
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
  path: "/socket.io",
  cors: {
    origin: [process.env.FRONTEND_URL],
    credentials: true,
  },
});
const cors = require("cors");

app.use(cors());

app.get("/", (req, res) => {
  res.send("Server is running.");
});

io.on("connection", (socket) => {
  socket.on("join-individual-room", (data) => {
    socket.join(data.user1.id + "&" + data.user2.id);
  });

  socket.on("join-notification-room", (data) => {
    console.log(data);
    socket.join(data.user.id + "unreaded-messages");
    socket.join(data.company + "group-notification");
  });

  socket.on("send-message", (data) => {
    socket.to(data.user2.id + "&" + data.user1.id).emit("get-message", {
      sender: data.user1,
      reciever: data.user2,
      content: data.content,
      type: data.type,
    });

    socket
      .to(data.user2.id + "unreaded-messages")
      .emit("get-unreaded-message", {
        sender: data.user1,
        content: data.content,
        type: data.type,
      });
  });

  socket.on("join-group-room", (data) => {
    socket.join(data.company1.id + "&group" + data.company2.id);
  });

  socket.on("send-message-group", (data) => {
    console.log(data);
    socket
      .to(data.company1.id + "&group" + data.company2.id)
      .emit("get-message-group", {
        senderUser: data.sender,
        senderCompany: data.company1,
        recieverCompany: data.company2,
        content: data.content,
        type: data.type,
        invoice: data.invoice,
      });

    socket
      .to(data.company1.id + "group-notification")
      .emit("get-message-group", {
        senderUser: data.sender,
        senderCompany: data.company1,
        recieverCompany: data.company2,
        content: data.content,
        type: data.type,
        invoice: data.invoice,
      });

    socket
      .to(data.company2.id + "group-notification")
      .emit("get-message-group", {
        senderUser: data.sender,
        senderCompany: data.company1,
        recieverCompany: data.company2,
        content: data.content,
        type: data.type,
        invoice: data.invoice,
      });
  });

  socket.on("server-update-read", (data) => {
    socket.to(data.user2.id + "&" + data.user1.id).emit("client-update-read");
  });

  socket.on("disconnect", () => {
    console.log("disconnect"); // the Set contains at least the socket ID
  });
});

server.listen(8080, () => {
  console.log("Server is running on port 8080.");
});
