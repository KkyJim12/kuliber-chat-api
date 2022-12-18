const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
  path: "/socket.io",
  cors: {
    origin: ["http://localhost:3000"],
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

  socket.on("send-message", (data) => {
    socket.to(data.user2.id + "&" + data.user1.id).emit("get-message", {
      sender: data.user1,
      reciever: data.user2,
      content: data.content,
      type: data.type,
    });
  });

  socket.on("disconnect", () => {
    console.log("disconnect"); // the Set contains at least the socket ID
  });
});

server.listen(5000, () => {
  console.log("listening on *:5000");
});
