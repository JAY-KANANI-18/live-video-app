import { Server, Socket } from 'socket.io';
import { logger } from './logger';

interface SocketUser {
  userId: string;
  socketId: string;
}

const onlineUsers = new Map<string, SocketUser>();

export const setupWebSocket = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    logger.info(`WebSocket client connected: ${socket.id}`);

    // User authentication and registration
    socket.on('register', (userId: string) => {
      onlineUsers.set(userId, { userId, socketId: socket.id });
      socket.join(`user:${userId}`);
      logger.info(`User registered: ${userId}`);

      // Broadcast user online status
      io.emit('user:online', { userId });
    });

    // Handle call signaling
    socket.on('call:initiate', (data) => {
      const { callerId, receiverId, callId, channelName } = data;
      logger.info(`Call initiated: ${callId} from ${callerId} to ${receiverId}`);
      
      // Send call notification to receiver
      io.to(`user:${receiverId}`).emit('call:incoming', {
        callId,
        callerId,
        channelName,
      });
    });

    socket.on('call:accept', (data) => {
      const { callId, callerId, receiverId } = data;
      logger.info(`Call accepted: ${callId}`);
      
      io.to(`user:${callerId}`).emit('call:accepted', { callId, receiverId });
    });

    socket.on('call:reject', (data) => {
      const { callId, callerId } = data;
      logger.info(`Call rejected: ${callId}`);
      
      io.to(`user:${callerId}`).emit('call:rejected', { callId });
    });

    socket.on('call:end', (data) => {
      const { callId, participants } = data;
      logger.info(`Call ended: ${callId}`);
      
      // Notify all participants
      participants?.forEach((userId: string) => {
        io.to(`user:${userId}`).emit('call:ended', { callId });
      });
    });

    // Chat messages
    socket.on('message:send', (data) => {
      const { senderId, receiverId, message, timestamp } = data;
      
      io.to(`user:${receiverId}`).emit('message:receive', {
        senderId,
        message,
        timestamp,
      });
    });

    // Gift sending in real-time
    socket.on('gift:send', (data) => {
      const { callId, giverId, receiverId, giftType, diamondValue } = data;
      logger.info(`Gift sent: ${giftType} from ${giverId} to ${receiverId}`);
      
      io.to(`user:${receiverId}`).emit('gift:receive', {
        callId,
        giverId,
        giftType,
        diamondValue,
      });
    });

    // Typing indicators
    socket.on('typing:start', (data) => {
      const { userId, receiverId } = data;
      io.to(`user:${receiverId}`).emit('typing:user', { userId, isTyping: true });
    });

    socket.on('typing:stop', (data) => {
      const { userId, receiverId } = data;
      io.to(`user:${receiverId}`).emit('typing:user', { userId, isTyping: false });
    });

    // Disconnect handling
    socket.on('disconnect', () => {
      logger.info(`WebSocket client disconnected: ${socket.id}`);
      
      // Find and remove user from online users
      for (const [userId, userData] of onlineUsers.entries()) {
        if (userData.socketId === socket.id) {
          onlineUsers.delete(userId);
          io.emit('user:offline', { userId });
          logger.info(`User disconnected: ${userId}`);
          break;
        }
      }
    });
  });

  return io;
};

export const getOnlineUsers = () => {
  return Array.from(onlineUsers.keys());
};
