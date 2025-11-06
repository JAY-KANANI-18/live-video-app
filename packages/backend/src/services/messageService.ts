import prisma from '../config/prisma';
import { RoomType } from '@prisma/client';

export interface CreateRoomParams {
  type: RoomType;
  user1Id?: string;
  user2Id?: string;
  callId?: string;
  name?: string;
  metadata?: any;
}

export interface CreateMessageParams {
  roomId: string;
  senderId: string;
  content: string;
  type?: string;
  metadata?: any;
}

export class MessageService {
  /**
   * Get or create a direct chat room between two users
   */
  async getOrCreateDirectRoom(user1Id: string, user2Id: string): Promise<any> {
    // Sort user IDs to ensure consistent room lookup
    const [userId1, userId2] = [user1Id, user2Id].sort();

    // Try to find existing room
    let room = await prisma.room.findFirst({
      where: {
        type: 'DIRECT',
        OR: [
          { user1Id: userId1, user2Id: userId2 },
          { user1Id: userId2, user2Id: userId1 },
        ],
      },
      include: {
        user1: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
        user2: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
      },
    });

    // Create room if it doesn't exist
    if (!room) {
      room = await prisma.room.create({
        data: {
          type: 'DIRECT',
          user1Id: userId1,
          user2Id: userId2,
        },
        include: {
          user1: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatar: true,
            },
          },
          user2: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatar: true,
            },
          },
        },
      });
    }

    return room;
  }

  /**
   * Get or create a call room
   */
  async getOrCreateCallRoom(callId: string): Promise<any> {
    let room = await prisma.room.findFirst({
      where: { callId },
      include: {
        call: {
          include: {
            caller: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatar: true,
              },
            },
            receiver: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    if (!room) {
      room = await prisma.room.create({
        data: {
          type: 'CALL',
          callId,
        },
        include: {
          call: {
            include: {
              caller: {
                select: {
                  id: true,
                  username: true,
                  displayName: true,
                  avatar: true,
                },
              },
              receiver: {
                select: {
                  id: true,
                  username: true,
                  displayName: true,
                  avatar: true,
                },
              },
            },
          },
        },
      });
    }

    return room;
  }

  /**
   * Create a new message with sequence ID
   * Guarantees message ordering within a room
   */
  async createMessage(params: CreateMessageParams): Promise<any> {
    const { roomId, senderId, content, type = 'text', metadata } = params;

    // Get next sequence ID for this room
    const lastMessage = await prisma.message.findFirst({
      where: { roomId },
      orderBy: { sequenceId: 'desc' },
      select: { sequenceId: true },
    });

    const nextSequenceId = (lastMessage?.sequenceId || 0) + 1;

    // Create message
    const message = await prisma.message.create({
      data: {
        roomId,
        senderId,
        content,
        type,
        metadata,
        sequenceId: nextSequenceId,
        readBy: [senderId], // Sender has read their own message
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
      },
    });

    // Update room last message info
    await prisma.room.update({
      where: { id: roomId },
      data: {
        lastMessageAt: new Date(),
        lastMessageText: content.substring(0, 100), // Preview
      },
    });

    return message;
  }

  /**
   * Get message history for a room
   * Returns last N messages in chronological order
   */
  async getMessageHistory(
    roomId: string,
    limit = 100,
    beforeSequenceId?: number
  ): Promise<any> {
    const messages = await prisma.message.findMany({
      where: {
        roomId,
        ...(beforeSequenceId ? { sequenceId: { lt: beforeSequenceId } } : {}),
      },
      orderBy: { sequenceId: 'desc' },
      take: limit,
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
      },
    });

    // Return in chronological order (oldest first)
    return messages.reverse();
  }

  /**
   * Mark messages as read by a user
   */
  async markMessagesAsRead(roomId: string, userId: string, upToSequenceId: number): Promise<void> {
    // Get all unread messages up to the sequence ID
    const messages = await prisma.message.findMany({
      where: {
        roomId,
        sequenceId: { lte: upToSequenceId },
      },
      select: { id: true, readBy: true },
    });

    // Update each message to add user to readBy array
    for (const message of messages) {
      const readBy = (message.readBy as string[]) || [];
      if (!readBy.includes(userId)) {
        await prisma.message.update({
          where: { id: message.id },
          data: {
            readBy: [...readBy, userId],
          },
        });
      }
    }
  }

  /**
   * Get unread message count for a user in a room
   */
  async getUnreadCount(roomId: string, userId: string): Promise<number> {
    const count = await prisma.message.count({
      where: {
        roomId,
        senderId: { not: userId }, // Don't count own messages
        readBy: {
          array_contains: userId,
          not: true,
        } as any,
      },
    });

    return count;
  }

  /**
   * Get all rooms for a user with last message info
   */
  async getUserRooms(userId: string): Promise<any[]> {
    const rooms = await prisma.room.findMany({
      where: {
        OR: [
          { user1Id: userId },
          { user2Id: userId },
        ],
      },
      include: {
        user1: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
        user2: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
        messages: {
          orderBy: { sequenceId: 'desc' },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                username: true,
                displayName: true,
              },
            },
          },
        },
      },
      orderBy: {
        lastMessageAt: 'desc',
      },
    });

    // Calculate unread count for each room
    const roomsWithUnread = await Promise.all(
      rooms.map(async (room) => {
        const unreadCount = await this.getUnreadCount(room.id, userId);
        return {
          ...room,
          unreadCount,
        };
      })
    );

    return roomsWithUnread;
  }

  /**
   * Delete old messages (keep only last 100 per room)
   */
  async cleanupOldMessages(roomId: string, keepLast = 100): Promise<void> {
    const messages = await prisma.message.findMany({
      where: { roomId },
      orderBy: { sequenceId: 'desc' },
      skip: keepLast,
      select: { id: true },
    });

    if (messages.length > 0) {
      await prisma.message.deleteMany({
        where: {
          id: { in: messages.map((m) => m.id) },
        },
      });
    }
  }
}

export const messageService = new MessageService();
