import { Socket } from "socket.io";
import jwt from 'jsonwebtoken';

interface JWTPayload {
    id: string,
    email: string,
}

export function socketAuthMiddleware(socket: Socket, next: (err?: Error) => void) {
    try {
        const token = socket.handshake.auth.token;
        if(!token) {
            return next(new Error('Authentication token missing.'));
        }
        const decoded = jwt.verify(token,process.env.NEXTAUTH_SECRET!) as JWTPayload;
        socket.data.userId = decoded.id,
        socket.data.userEmail = decoded.email,
        next();
    } catch (error) {
        next(new Error('Authentication Failed'));
    }
}