import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { registerSocketHandler } from "./socket.js";

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);
  registerSocketHandler(io, socket);
})

httpServer.listen(4000, () => {
  console.log("Socket server running at http://localhost:4000");
});
