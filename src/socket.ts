import { Socket, Server } from "socket.io";

export function registerSocketHandler(io:Server, socket: Socket) {
    socket.on("join-hive", (hiveName: string) => {
        socket.join(hiveName);
        const roomSize = io.sockets.adapter.rooms.get(hiveName)?.size || 0;
        io.to(hiveName).emit(`hiveUserCount:${hiveName}`, roomSize);
      });
    
      socket.on("sendMessage", ({ hiveName, message }) => {
        io.to(hiveName).emit("newMessage", {
          userId: socket.id,
          message,
          timestamp: new Date(),
        });
      });
    
      socket.on("disconnecting", () => {
        socket.rooms.forEach((room) => {
          if (room !== socket.id) {
            const roomSize = (io.sockets.adapter.rooms.get(room)?.size || 1) - 1;
            io.to(room).emit(`hiveUserCount:${room}`, roomSize);
          }
        });
        console.log(`Client disconnected: ${socket.id}`);
      });
}