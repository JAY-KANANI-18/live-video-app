import { create } from 'zustand';
import { chatService, Room, Message } from '../services/chatService';
import { websocketService } from '../services/websocketService';

interface ChatState {
  // State
  rooms: Room[];
  messages: Map<string, Message[]>;
  currentRoomId: string | null;
  isConnected: boolean;
  typingUsers: Map<string, Set<string>>;
  onlineUsers: Map<string, Set<string>>;

  // Actions
  initialize: () => Promise<void>;
  cleanup: () => void;
  loadRooms: () => Promise<void>;
  loadMessages: (roomId: string, limit?: number) => Promise<void>;
  loadMoreMessages: (roomId: string) => Promise<void>;
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
  sendMessage: (roomId: string, content: string) => void;
  sendTyping: (roomId: string, isTyping: boolean) => void;
  markAsRead: (roomId: string) => Promise<void>;
  createDirectRoom: (targetUserId: string) => Promise<string>;

  // Internal
  handleNewMessage: (message: Message) => void;
  handleTyping: (data: any) => void;
  handlePresenceUpdate: (data: any) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  // Initial state
  rooms: [],
  messages: new Map(),
  currentRoomId: null,
  isConnected: false,
  typingUsers: new Map(),
  onlineUsers: new Map(),

  /**
   * Initialize WebSocket connection and load rooms
   */
  initialize: async () => {
    try {
      // Connect to WebSocket
      await websocketService.connect();
      set({ isConnected: true });

      // Setup message handlers
      websocketService.on('message', get().handleNewMessage);
      websocketService.on('typing', get().handleTyping);
      websocketService.on('presenceUpdate', get().handlePresenceUpdate);
      websocketService.on('connected', () => {
        console.log('WebSocket connection confirmed');
        set({ isConnected: true });
      });

      // Load rooms
      await get().loadRooms();
    } catch (error) {
      console.error('Failed to initialize chat:', error);
      set({ isConnected: false });
    }
  },

  /**
   * Cleanup WebSocket connection
   */
  cleanup: () => {
    websocketService.disconnect();
    set({ isConnected: false, currentRoomId: null });
  },

  /**
   * Load all chat rooms
   */
  loadRooms: async () => {
    try {
      const { rooms } = await chatService.getRooms();
      set({ rooms });
    } catch (error) {
      console.error('Failed to load rooms:', error);
    }
  },

  /**
   * Load messages for a room
   */
  loadMessages: async (roomId: string, limit = 50) => {
    try {
      const { messages: newMessages } = await chatService.getMessages(roomId, limit);
      const messagesMap = new Map(get().messages);
      messagesMap.set(roomId, newMessages);
      set({ messages: messagesMap });
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  },

  /**
   * Load more (older) messages for a room
   */
  loadMoreMessages: async (roomId: string) => {
    try {
      const currentMessages = get().messages.get(roomId) || [];
      if (currentMessages.length === 0) return;

      const oldestMessage = currentMessages[0];
      const { messages: olderMessages, hasMore } = await chatService.getMessages(
        roomId,
        50,
        oldestMessage.sequenceId
      );

      if (olderMessages.length > 0) {
        const messagesMap = new Map(get().messages);
        messagesMap.set(roomId, [...olderMessages, ...currentMessages]);
        set({ messages: messagesMap });
      }
    } catch (error) {
      console.error('Failed to load more messages:', error);
    }
  },

  /**
   * Join a room via WebSocket
   */
  joinRoom: (roomId: string) => {
    websocketService.joinRoom(roomId);
    set({ currentRoomId: roomId });
  },

  /**
   * Leave a room via WebSocket
   */
  leaveRoom: (roomId: string) => {
    websocketService.leaveRoom(roomId);
    if (get().currentRoomId === roomId) {
      set({ currentRoomId: null });
    }
  },

  /**
   * Send a message
   */
  sendMessage: (roomId: string, content: string) => {
    if (!content.trim()) return;
    
    console.log('Sending message:', { roomId, content });
    
    try {
      websocketService.sendMessage(roomId, content.trim());
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  },

  /**
   * Send typing indicator
   */
  sendTyping: (roomId: string, isTyping: boolean) => {
    try {
      if (get().isConnected) {
        websocketService.sendTyping(roomId, isTyping);
      }
    } catch (error) {
      console.error('Failed to send typing:', error);
    }
  },

  /**
   * Mark messages as read
   */
  markAsRead: async (roomId: string) => {
    try {
      const messages = get().messages.get(roomId) || [];
      if (messages.length === 0) return;

      const lastMessage = messages[messages.length - 1];
      
      // Check if already marked as read
      const currentRoom = get().rooms.find(r => r.id === roomId);
      if (currentRoom && currentRoom.unreadCount === 0) {
        return; // Already marked as read, skip
      }

      await chatService.markAsRead(roomId, lastMessage.sequenceId);

      // Update room unread count (only if changed)
      const rooms = get().rooms.map((room) =>
        room.id === roomId ? { ...room, unreadCount: 0 } : room
      );
      set({ rooms });
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  },

  /**
   * Create direct chat room with another user
   */
  createDirectRoom: async (targetUserId: string): Promise<string> => {
    try {
      const { room, messages } = await chatService.createDirectRoom(targetUserId);

      // Add room to list if not exists
      const rooms = get().rooms;
      const existingRoom = rooms.find((r) => r.id === room.id);
      if (!existingRoom) {
        set({ rooms: [room, ...rooms] });
      }

      // Set messages
      const messagesMap = new Map(get().messages);
      messagesMap.set(room.id, messages);
      set({ messages: messagesMap });

      return room.id;
    } catch (error) {
      console.error('Failed to create direct room:', error);
      throw error;
    }
  },

  /**
   * Handle incoming message from WebSocket
   */
  handleNewMessage: (message: Message) => {
    const messagesMap = new Map(get().messages);
    const roomMessages = messagesMap.get(message.roomId) || [];

    // Check if message already exists (prevent duplicates)
    const exists = roomMessages.some((m) => m.id === message.id);
    if (!exists) {
      messagesMap.set(message.roomId, [...roomMessages, message]);
      set({ messages: messagesMap });
    }

    // Update room last message
    const rooms = get().rooms.map((room) =>
      room.id === message.roomId
        ? {
            ...room,
            lastMessageAt: message.createdAt,
            lastMessageText: message.content,
            unreadCount:
              get().currentRoomId === message.roomId
                ? 0
                : (room.unreadCount || 0) + 1,
          }
        : room
    );

    // Sort rooms by last message time
    rooms.sort((a, b) => {
      const timeA = new Date(a.lastMessageAt || 0).getTime();
      const timeB = new Date(b.lastMessageAt || 0).getTime();
      return timeB - timeA;
    });

    set({ rooms });
  },

  /**
   * Handle typing indicator
   */
  handleTyping: (data: { userId: string; roomId?: string; isTyping: boolean }) => {
    if (!data.roomId) return;

    const typingUsers = new Map(get().typingUsers);
    const roomTyping = typingUsers.get(data.roomId) || new Set();

    if (data.isTyping) {
      roomTyping.add(data.userId);
    } else {
      roomTyping.delete(data.userId);
    }

    typingUsers.set(data.roomId, roomTyping);
    set({ typingUsers });

    // Auto-clear typing after 3 seconds
    if (data.isTyping) {
      setTimeout(() => {
        const currentTyping = get().typingUsers.get(data.roomId!) || new Set();
        currentTyping.delete(data.userId);
        set({ typingUsers: new Map(get().typingUsers) });
      }, 3000);
    }
  },

  /**
   * Handle presence update
   */
  handlePresenceUpdate: (data: { userId: string; roomId?: string; status: string }) => {
    if (!data.roomId) return;

    const onlineUsers = new Map(get().onlineUsers);
    const roomOnline = onlineUsers.get(data.roomId) || new Set();

    if (data.status === 'online') {
      roomOnline.add(data.userId);
    } else {
      roomOnline.delete(data.userId);
    }

    onlineUsers.set(data.roomId, roomOnline);
    set({ onlineUsers });
  },
}));
