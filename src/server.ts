import express from "express";
import http from "http";
import dotenv from "dotenv";
import { setupSocket } from "./socket/index.js";
import dbConnect from "./socket/utils/connectDB.js";

dotenv.config();

const app = express();
const server = http.createServer(app);


await dbConnect();

setupSocket(server);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
});




