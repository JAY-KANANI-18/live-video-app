import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { messageService } from '../services/messageService';
import { websocketService } from '../services/websocketService';

const router = Router();

/**
 * GET /chat/rooms
 * Get all chat rooms for the authenticated user
 */
router.get('/rooms', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    const rooms = await messageService.getUserRooms(userId);

    res.json({
      rooms,
      count: rooms.length,
    });
  } catch (error: any) {
    console.error('Get rooms error:', error);
    res.status(500).json({ error: error.message || 'Failed to get rooms' });
  }
});

/**
 * GET /chat/rooms/:roomId/messages
 * Get message history for a specific room
 */
router.get('/rooms/:roomId/messages', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { roomId } = req.params;
    const limit = parseInt(req.query.limit as string) || 100;
    const beforeSequenceId = req.query.beforeSequenceId
      ? parseInt(req.query.beforeSequenceId as string)
      : undefined;

    // Get messages
    const messages = await messageService.getMessageHistory(roomId, limit, beforeSequenceId);

    // Get unread count
    const unreadCount = await messageService.getUnreadCount(roomId, userId);

    res.json({
      messages,
      count: messages.length,
      unreadCount,
      hasMore: messages.length === limit,
    });
  } catch (error: any) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: error.message || 'Failed to get messages' });
  }
});

/**
 * GET /chat/rooms/:roomId/unread
 * Get unread message count for a room
 */
router.get('/rooms/:roomId/unread', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { roomId } = req.params;

    const unreadCount = await messageService.getUnreadCount(roomId, userId);

    res.json({
      roomId,
      unreadCount,
    });
  } catch (error: any) {
    console.error('Get unread count error:', error);
    res.status(500).json({ error: error.message || 'Failed to get unread count' });
  }
});

/**
 * POST /chat/rooms/:roomId/read
 * Mark messages as read up to a certain sequence ID
 */
router.post('/rooms/:roomId/read', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { roomId } = req.params;
    const { sequenceId } = req.body;

    if (!sequenceId) {
      return res.status(400).json({ error: 'Sequence ID required' });
    }

    await messageService.markMessagesAsRead(roomId, userId, sequenceId);

    res.json({
      success: true,
      roomId,
      markedUpTo: sequenceId,
    });
  } catch (error: any) {
    console.error('Mark read error:', error);
    res.status(500).json({ error: error.message || 'Failed to mark as read' });
  }
});

/**
 * GET /chat/rooms/:roomId/online
 * Get list of online users in a room
 */
router.get('/rooms/:roomId/online', requireAuth, async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;

    const onlineUsers = websocketService.getOnlineUsersInRoom(roomId);

    res.json({
      roomId,
      onlineUsers,
      count: onlineUsers.length,
    });
  } catch (error: any) {
    console.error('Get online users error:', error);
    res.status(500).json({ error: error.message || 'Failed to get online users' });
  }
});

/**
 * POST /chat/direct
 * Get or create a direct chat room with another user
 */
router.post('/direct', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { targetUserId } = req.body;

    if (!targetUserId) {
      return res.status(400).json({ error: 'Target user ID required' });
    }

    if (targetUserId === userId) {
      return res.status(400).json({ error: 'Cannot create room with yourself' });
    }

    const room = await messageService.getOrCreateDirectRoom(userId, targetUserId);

    // Get recent messages
    const messages = await messageService.getMessageHistory(room.id, 50);

    // Get unread count
    const unreadCount = await messageService.getUnreadCount(room.id, userId);

    res.json({
      room,
      messages,
      unreadCount,
    });
  } catch (error: any) {
    console.error('Create direct room error:', error);
    res.status(500).json({ error: error.message || 'Failed to create room' });
  }
});

/**
 * DELETE /chat/rooms/:roomId/cleanup
 * Admin endpoint to cleanup old messages (keep last 100)
 */
router.delete('/rooms/:roomId/cleanup', requireAuth, async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const keepLast = parseInt(req.query.keepLast as string) || 100;

    // Only admins should be able to do this
    if (req.user!.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    await messageService.cleanupOldMessages(roomId, keepLast);

    res.json({
      success: true,
      message: `Cleaned up old messages, kept last ${keepLast}`,
    });
  } catch (error: any) {
    console.error('Cleanup error:', error);
    res.status(500).json({ error: error.message || 'Failed to cleanup messages' });
  }
});

export default router;
