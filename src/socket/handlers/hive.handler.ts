import { Server, Socket } from "socket.io";
import { onlineCounts, socketToHiveMap } from "../index.js";
import { checkSubscription } from "../controllers/hive.controller.js";

export default function hiveSocketHandler(io: Server, socket: Socket) {
    socket.on("join-hive", async (hiveId: string) => {
      const userId = socket.data.userId;

      const isSubscribed = await checkSubscription(userId, hiveId);
    console.log(`Checking subscription for ${userId} in ${hiveId}: ${isSubscribed}`);

    if (!isSubscribed) {
      console.log(`User ${userId} is not subscribed to hive ${hiveId}, ignoring join.`);
      return;
    }
  
      if (!onlineCounts[hiveId]) {
        onlineCounts[hiveId] = new Map();
      }
      if (!onlineCounts[hiveId].has(userId)) {
        onlineCounts[hiveId].set(userId, new Set());
      }
  
      onlineCounts[hiveId].get(userId)!.add(socket.id);
      socketToHiveMap.set(socket.id, { hiveId, userId });
      socket.join(hiveId);
      io.to(hiveId).emit(`hiveOnlineMembers:${hiveId}`, onlineCounts[hiveId].size);
    });
  
    socket.on("leave-hive", (hiveId: string) => {
      const userId = socket.data.userId;
      socket.leave(hiveId);
  
      if (onlineCounts[hiveId] && onlineCounts[hiveId].has(userId)) {
        const userSockets = onlineCounts[hiveId].get(userId)!;
        userSockets.delete(socket.id);
  
        if (userSockets.size === 0) {
          onlineCounts[hiveId].delete(userId);
        }
  
        io.to(hiveId).emit(`hiveOnlineMembers:${hiveId}`, onlineCounts[hiveId].size);
      }
    });
  }