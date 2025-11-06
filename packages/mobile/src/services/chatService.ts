import apiClient from '../config/api';

export interface Room {
  id: string;
  type: 'DIRECT' | 'CALL' | 'GROUP';
  name?: string;
  user1?: {
    id: string;
    username: string;
    displayName?: string;
    avatar?: string;
  };
  user2?: {
    id: string;
    username: string;
    displayName?: string;
    avatar?: string;
  };
  lastMessageAt?: string;
  lastMessageText?: string;
  unreadCount?: number;
}

export interface Message {
  id: string;
  roomId: string;
  senderId: string;
  content: string;
  type: string;
  sequenceId: number;
  sender: {
    id: string;
    username: string;
    displayName?: string;
    avatar?: string;
  };
  createdAt: string;
  readBy?: string[];
}

class ChatService {
  /**
   * Get all chat rooms for the authenticated user
   */
  async getRooms(): Promise<{ rooms: Room[]; count: number }> {
    const response = await apiClient.get('/chat/rooms');
    return response.data;
  }

  /**
   * Get message history for a specific room
   */
  async getMessages(
    roomId: string,
    limit = 100,
    beforeSequenceId?: number
  ): Promise<{
    messages: Message[];
    count: number;
    unreadCount: number;
    hasMore: boolean;
  }> {
    const params: any = { limit };
    if (beforeSequenceId) {
      params.beforeSequenceId = beforeSequenceId;
    }

    const response = await apiClient.get(`/chat/rooms/${roomId}/messages`, {
      params,
    });
    return response.data;
  }

  /**
   * Get unread message count for a room
   */
  async getUnreadCount(roomId: string): Promise<number> {
    const response = await apiClient.get(`/chat/rooms/${roomId}/unread`);
    return response.data.unreadCount;
  }

  /**
   * Mark messages as read
   */
  async markAsRead(roomId: string, sequenceId: number): Promise<void> {
    await apiClient.post(`/chat/rooms/${roomId}/read`, { sequenceId });
  }

  /**
   * Get online users in a room
   */
  async getOnlineUsers(roomId: string): Promise<string[]> {
    const response = await apiClient.get(`/chat/rooms/${roomId}/online`);
    return response.data.onlineUsers;
  }

  /**
   * Create or get direct chat room with another user
   */
  async createDirectRoom(targetUserId: string): Promise<{
    room: Room;
    messages: Message[];
    unreadCount: number;
  }> {
    const response = await apiClient.post('/chat/direct', { targetUserId });
    return response.data;
  }
}

export const chatService = new ChatService();
