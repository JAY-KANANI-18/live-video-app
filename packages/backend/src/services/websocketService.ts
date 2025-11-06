import { WebSocket, WebSocketServer } from 'ws';
import { Server as HTTPServer } from 'http';
import { verifyAccessToken, JWTPayload } from '../utils/jwt';
import { messageService } from './messageService';
import { getRedisPublisher, getRedisSubscriber } from '../config/redis';
import { logger } from '../config/logger';

// Redis channel for broadcasting messages across instances
const REDIS_CHANNEL = 'chat:broadcast';

interface AuthenticatedWebSocket extends WebSocket {
  userId?: string;
  user?: JWTPayload;
  rooms?: Set<string>;
  isAlive?: boolean;
}

interface WebSocketMessage {
  type: string;
  payload: any;
}

interface BroadcastMessage {
  roomId: string;
  event: string;
  data: any;
  excludeUserId?: string;
}

export class WebSocketService {
  private wss: WebSocketServer | null = null;
  private clients: Map<string, Set<AuthenticatedWebSocket>> = new Map();
  private redisPub = getRedisPublisher();
  private redisSub = getRedisSubscriber();
  private heartbeatInterval: NodeJS.Timeout | null = null;

  /**
   * Initialize WebSocket server
   */
  initialize(server: HTTPServer) {
    this.wss = new WebSocketServer({ server, path: '/ws' });

    logger.info('WebSocket server initialized on path /ws');

    // Handle new connections
    this.wss.on('connection', this.handleConnection.bind(this));

    // Subscribe to Redis channel for cross-instance broadcasting
    this.setupRedisSubscription();

    // Setup heartbeat to detect disconnected clients
    this.setupHeartbeat();
  }

  /**
   * Handle new WebSocket connection
   */
  private async handleConnection(ws: AuthenticatedWebSocket, req: any) {
    logger.info('New WebSocket connection attempt');

    // Extract token from query params
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const token = url.searchParams.get('token');

    if (!token) {
      ws.close(4001, 'Missing authentication token');
      return;
    }

    try {
      // Verify JWT token
      const payload = verifyAccessToken(token);
      ws.userId = payload.userId;
      ws.user = payload;
      ws.rooms = new Set();
      ws.isAlive = true;

      // Add to clients map
      if (!this.clients.has(payload.userId)) {
        this.clients.set(payload.userId, new Set());
      }
      this.clients.get(payload.userId)!.add(ws);

      logger.info(`User ${payload.userId} connected via WebSocket`);

      // Send connection success
      this.send(ws, {
        type: 'connected',
        payload: {
          userId: payload.userId,
          timestamp: new Date().toISOString(),
        },
      });

      // Handle messages
      ws.on('message', (data) => this.handleMessage(ws, data));

      // Handle disconnect
      ws.on('close', () => this.handleDisconnect(ws));

      // Handle errors
      ws.on('error', (error) => {
        logger.error(`WebSocket error for user ${ws.userId}:`, error);
      });

      // Handle pong for heartbeat
      ws.on('pong', () => {
        ws.isAlive = true;
      });

    } catch (error) {
      logger.error('WebSocket authentication failed:', error);
      ws.close(4001, 'Invalid authentication token');
    }
  }

  /**
   * Handle incoming messages from client
   */
  private async handleMessage(ws: AuthenticatedWebSocket, data: any) {
    try {
      const message: WebSocketMessage = JSON.parse(data.toString());
      logger.info(`Message from ${ws.userId}: ${message.type}`);

      switch (message.type) {
        case 'joinRoom':
          await this.handleJoinRoom(ws, message.payload);
          break;

        case 'leaveRoom':
          await this.handleLeaveRoom(ws, message.payload);
          break;

        case 'sendMessage':
          await this.handleSendMessage(ws, message.payload);
          break;

        case 'typing':
          await this.handleTyping(ws, message.payload);
          break;

        case 'markRead':
          await this.handleMarkRead(ws, message.payload);
          break;

        case 'ping':
          this.send(ws, { type: 'pong', payload: {} });
          break;

        default:
          logger.warn(`Unknown message type: ${message.type}`);
      }
    } catch (error) {
      logger.error('Error handling WebSocket message:', error);
      this.send(ws, {
        type: 'error',
        payload: { message: 'Invalid message format' },
      });
    }
  }

  /**
   * Handle joinRoom event
   */
  private async handleJoinRoom(ws: AuthenticatedWebSocket, payload: any) {
    const { roomId, targetUserId } = payload;

    try {
      let room;

      if (roomId) {
        // Join existing room
        room = await messageService.getOrCreateDirectRoom(ws.userId!, roomId);
      } else if (targetUserId) {
        // Create or get direct room with target user
        room = await messageService.getOrCreateDirectRoom(ws.userId!, targetUserId);
      } else {
        throw new Error('Either roomId or targetUserId required');
      }

      // Add room to user's rooms
      ws.rooms!.add(room.id);

      // Get recent messages
      const messages = await messageService.getMessageHistory(room.id, 50);

      // Get unread count
      const unreadCount = await messageService.getUnreadCount(room.id, ws.userId!);

      // Send room joined confirmation
      this.send(ws, {
        type: 'roomJoined',
        payload: {
          room,
          messages,
          unreadCount,
        },
      });

      // Notify room about user presence
      this.broadcastToRoom(room.id, 'presenceUpdate', {
        userId: ws.userId,
        status: 'online',
        timestamp: new Date().toISOString(),
      }, ws.userId);

      logger.info(`User ${ws.userId} joined room ${room.id}`);
    } catch (error: any) {
      logger.error('Error joining room:', error);
      this.send(ws, {
        type: 'error',
        payload: { message: error.message },
      });
    }
  }

  /**
   * Handle leaveRoom event
   */
  private async handleLeaveRoom(ws: AuthenticatedWebSocket, payload: any) {
    const { roomId } = payload;

    if (!ws.rooms?.has(roomId)) {
      return;
    }

    ws.rooms.delete(roomId);

    // Notify room about user leaving
    this.broadcastToRoom(roomId, 'presenceUpdate', {
      userId: ws.userId,
      status: 'offline',
      timestamp: new Date().toISOString(),
    }, ws.userId);

    this.send(ws, {
      type: 'roomLeft',
      payload: { roomId },
    });

    logger.info(`User ${ws.userId} left room ${roomId}`);
  }

  /**
   * Handle sendMessage event
   */
  private async handleSendMessage(ws: AuthenticatedWebSocket, payload: any) {
    const { roomId, content, type = 'text', metadata } = payload;

    if (!ws.rooms?.has(roomId)) {
      this.send(ws, {
        type: 'error',
        payload: { message: 'Not joined to this room' },
      });
      return;
    }

    try {
      // Persist message to database
      const message = await messageService.createMessage({
        roomId,
        senderId: ws.userId!,
        content,
        type,
        metadata,
      });

      // Broadcast message to all users in the room via Redis
      this.publishToRedis({
        roomId,
        event: 'message',
        data: message,
      });

      logger.info(`Message sent in room ${roomId} by ${ws.userId}`);
    } catch (error: any) {
      logger.error('Error sending message:', error);
      this.send(ws, {
        type: 'error',
        payload: { message: error.message },
      });
    }
  }

  /**
   * Handle typing indicator
   */
  private async handleTyping(ws: AuthenticatedWebSocket, payload: any) {
    const { roomId, isTyping } = payload;

    if (!ws.rooms?.has(roomId)) {
      return;
    }

    // Broadcast typing status to other users in room
    this.broadcastToRoom(roomId, 'typing', {
      userId: ws.userId,
      username: ws.user?.email || ws.user?.phoneNumber,
      isTyping,
    }, ws.userId);
  }

  /**
   * Handle mark messages as read
   */
  private async handleMarkRead(ws: AuthenticatedWebSocket, payload: any) {
    const { roomId, sequenceId } = payload;

    try {
      await messageService.markMessagesAsRead(roomId, ws.userId!, sequenceId);

      this.send(ws, {
        type: 'markedRead',
        payload: { roomId, sequenceId },
      });
    } catch (error: any) {
      logger.error('Error marking messages as read:', error);
    }
  }

  /**
   * Handle client disconnect
   */
  private handleDisconnect(ws: AuthenticatedWebSocket) {
    if (!ws.userId) return;

    // Remove from clients map
    const userClients = this.clients.get(ws.userId);
    if (userClients) {
      userClients.delete(ws);
      if (userClients.size === 0) {
        this.clients.delete(ws.userId);
      }
    }

    // Notify all rooms about user going offline
    if (ws.rooms) {
      ws.rooms.forEach((roomId) => {
        this.broadcastToRoom(roomId, 'presenceUpdate', {
          userId: ws.userId,
          status: 'offline',
          timestamp: new Date().toISOString(),
        }, ws.userId);
      });
    }

    logger.info(`User ${ws.userId} disconnected from WebSocket`);
  }

  /**
   * Send message to a specific WebSocket client
   */
  private send(ws: AuthenticatedWebSocket, message: any) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  /**
   * Broadcast message to all users in a room (local instance only)
   */
  private broadcastToRoomLocal(roomId: string, event: string, data: any, excludeUserId?: string) {
    this.clients.forEach((clientSet, userId) => {
      if (excludeUserId && userId === excludeUserId) return;

      clientSet.forEach((ws) => {
        if (ws.rooms?.has(roomId)) {
          this.send(ws, { type: event, payload: data });
        }
      });
    });
  }

  /**
   * Broadcast message to all users in a room (via Redis for multi-instance)
   */
  private broadcastToRoom(roomId: string, event: string, data: any, excludeUserId?: string) {
    this.publishToRedis({ roomId, event, data, excludeUserId });
  }

  /**
   * Publish message to Redis for cross-instance broadcasting
   */
  private publishToRedis(message: BroadcastMessage) {
    this.redisPub.publish(REDIS_CHANNEL, JSON.stringify(message));
  }

  /**
   * Setup Redis subscription for receiving broadcasts from other instances
   */
  private setupRedisSubscription() {
    this.redisSub.subscribe(REDIS_CHANNEL, (err) => {
      if (err) {
        logger.error('Failed to subscribe to Redis channel:', err);
      } else {
        logger.info(`Subscribed to Redis channel: ${REDIS_CHANNEL}`);
      }
    });

    this.redisSub.on('message', (channel, message) => {
      if (channel === REDIS_CHANNEL) {
        try {
          const broadcastMsg: BroadcastMessage = JSON.parse(message);
          this.broadcastToRoomLocal(
            broadcastMsg.roomId,
            broadcastMsg.event,
            broadcastMsg.data,
            broadcastMsg.excludeUserId
          );
        } catch (error) {
          logger.error('Error processing Redis message:', error);
        }
      }
    });
  }

  /**
   * Setup heartbeat to detect dead connections
   */
  private setupHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      this.clients.forEach((clientSet) => {
        clientSet.forEach((ws) => {
          if (ws.isAlive === false) {
            logger.info(`Terminating dead connection for user ${ws.userId}`);
            return ws.terminate();
          }

          ws.isAlive = false;
          ws.ping();
        });
      });
    }, 30000); // Every 30 seconds
  }

  /**
   * Get online users in a room
   */
  getOnlineUsersInRoom(roomId: string): string[] {
    const onlineUsers: Set<string> = new Set();

    this.clients.forEach((clientSet, userId) => {
      clientSet.forEach((ws) => {
        if (ws.rooms?.has(roomId)) {
          onlineUsers.add(userId);
        }
      });
    });

    return Array.from(onlineUsers);
  }

  /**
   * Send message to specific user (all their connections)
   */
  sendToUser(userId: string, event: string, data: any) {
    const userClients = this.clients.get(userId);
    if (userClients) {
      userClients.forEach((ws) => {
        this.send(ws, { type: event, payload: data });
      });
    }
  }

  /**
   * Cleanup on server shutdown
   */
  async shutdown() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    if (this.wss) {
      this.wss.close();
    }

    await this.redisSub.unsubscribe(REDIS_CHANNEL);
  }
}

export const websocketService = new WebSocketService();
