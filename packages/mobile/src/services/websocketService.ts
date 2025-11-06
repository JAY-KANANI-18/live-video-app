import AsyncStorage from '@react-native-async-storage/async-storage';

type MessageHandler = (data: any) => void;

interface WebSocketMessage {
  type: string;
  payload: any;
}

export class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private messageHandlers: Map<string, Set<MessageHandler>> = new Map();
  private connectionPromise: Promise<void> | null = null;
  private pingInterval: NodeJS.Timeout | null = null;

  /**
   * Connect to WebSocket server
   */
  async connect(): Promise<void> {
    // Return existing connection promise if already connecting
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    // Already connected
    if (this.ws?.readyState === WebSocket.OPEN) {
      return Promise.resolve();
    }

    this.connectionPromise = new Promise(async (resolve, reject) => {
      try {
        // Get token from AsyncStorage
        const token = await AsyncStorage.getItem('accessToken');
        if (!token) {
          this.connectionPromise = null;
          return reject(new Error('No access token available. Please login first.'));
        }

        const wsUrl = `ws://localhost:3000/ws?token=${token}`;
        console.log('Connecting to WebSocket:', wsUrl);

        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.reconnectAttempts = 0;
          this.connectionPromise = null;
          this.startPingInterval();
          resolve();
        };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          console.log('WebSocket message:', message.type);
          this.handleMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
        };

        this.ws.onclose = () => {
          console.log('WebSocket closed');
          this.connectionPromise = null;
          this.stopPingInterval();
          this.attemptReconnect();
        };

        // Connection timeout
        setTimeout(() => {
          if (this.ws?.readyState !== WebSocket.OPEN) {
            this.connectionPromise = null;
            reject(new Error('WebSocket connection timeout'));
          }
        }, 10000);
      } catch (error: any) {
        this.connectionPromise = null;
        reject(error);
      }
    });

    return this.connectionPromise;
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect() {
    this.stopPingInterval();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.connectionPromise = null;
  }

  /**
   * Send message to server
   */
  send(type: string, payload: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      const message = JSON.stringify({ type, payload });
      this.ws.send(message);
      console.log('Sent WebSocket message:', type);
    } else {
      console.warn('WebSocket not connected, cannot send message');
    }
  }

  /**
   * Subscribe to specific message type
   */
  on(type: string, handler: MessageHandler) {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, new Set());
    }
    this.messageHandlers.get(type)!.add(handler);
  }

  /**
   * Unsubscribe from message type
   */
  off(type: string, handler: MessageHandler) {
    const handlers = this.messageHandlers.get(type);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  /**
   * Join a chat room
   */
  joinRoom(roomId: string) {
    this.send('joinRoom', { roomId });
  }

  /**
   * Leave a chat room
   */
  leaveRoom(roomId: string) {
    this.send('leaveRoom', { roomId });
  }

  /**
   * Send a chat message
   */
  sendMessage(roomId: string, content: string, type = 'text', metadata?: any) {
    this.send('sendMessage', { roomId, content, type, metadata });
  }

  /**
   * Send typing indicator
   */
  sendTyping(roomId: string, isTyping: boolean) {
    this.send('typing', { roomId, isTyping });
  }

  /**
   * Mark messages as read
   */
  markRead(roomId: string, sequenceId: number) {
    this.send('markRead', { roomId, sequenceId });
  }

  /**
   * Handle incoming messages
   */
  private handleMessage(message: WebSocketMessage) {
    const handlers = this.messageHandlers.get(message.type);
    if (handlers) {
      handlers.forEach((handler) => handler(message.payload));
    }

    // Also trigger wildcard handlers
    const wildcardHandlers = this.messageHandlers.get('*');
    if (wildcardHandlers) {
      wildcardHandlers.forEach((handler) => handler(message));
    }
  }

  /**
   * Attempt to reconnect
   */
  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    setTimeout(() => {
      this.connect().catch((error) => {
        console.error('Reconnection failed:', error);
      });
    }, delay);
  }

  /**
   * Start ping interval to keep connection alive
   */
  private startPingInterval() {
    this.pingInterval = setInterval(() => {
      this.send('ping', {});
    }, 25000); // Every 25 seconds
  }

  /**
   * Stop ping interval
   */
  private stopPingInterval() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

export const websocketService = new WebSocketService();
