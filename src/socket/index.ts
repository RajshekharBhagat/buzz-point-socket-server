import { Server as SocketIOServer } from "socket.io";
import type { Server } from "http";
import hiveSocketHandler from "./handlers/hive.handler.js";
import { socketAuthMiddleware } from "./middlewares/auth.middleware.js";



export const onlineCounts: Record<string, Map<string, Set<string>>> = {};
export const socketToHiveMap: Map<string, { hiveId: string; userId: string }> = new Map();

export function setupSocket(server: Server) {
  const io = new SocketIOServer(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ["GET", "POST"],
    },
  });
  io.use(socketAuthMiddleware);
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);
  
    hiveSocketHandler(io, socket);
  
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
  
      const mapping = socketToHiveMap.get(socket.id);
      if (!mapping) return;
  
      const { hiveId, userId } = mapping;
      const userSockets = onlineCounts[hiveId]?.get(userId);
  
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          onlineCounts[hiveId].delete(userId);
        }
      }
      socketToHiveMap.delete(socket.id);
      io.to(hiveId).emit(`hiveUserCount:${hiveId}`, onlineCounts[hiveId]?.size || 0);
    });
  });
}
