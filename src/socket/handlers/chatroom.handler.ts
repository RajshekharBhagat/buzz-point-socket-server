import { Server, Socket } from "socket.io";
import { checkSubscription } from "../controllers/hive.controller.js";
import MessageModel from "../models/Message.model.js";

export default function chatroomHandler(io: Server, socket: Socket) {
    socket.on('join-chatroom', async(hiveId: string) => {
        const userId = socket.data.userId;
        const isSubscribed = await checkSubscription(userId, hiveId);
        if(!isSubscribed) {
            console.log(`User ${userId} not subscribed to ${hiveId}`);
            return;
        }

        socket.join(`chatroom:${hiveId}`);
        
        const messages = await MessageModel.find({hive: hiveId})
            .sort({createdAt: -1})
            .limit(50)
            .lean();
        socket.emit('chatroom:history', messages.reverse());
    });

    socket.on('chatroom:message', async (data: { hiveId: string, content: string }) => {
        const { hiveId, content } = data;
        const userId = socket.data.userId;
        
        const isSubscribed = await checkSubscription(userId, hiveId);
        if(!isSubscribed) return;

        const newMessage = await MessageModel.create({
            hive: hiveId, 
            user: userId, 
            content: content
        });

        io.to(`chatroom:${hiveId}`).emit('chatroom:message', newMessage);
    });
}