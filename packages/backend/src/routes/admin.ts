import { Router, Request, Response } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth';
import prisma from '../config/prisma';

const router = Router();

// All admin routes require authentication and admin role
router.use(requireAuth);
router.use(requireAdmin);

/**
 * GET /admin/transactions
 * Get all transactions for audit (with filters)
 */
router.get('/transactions', async (req: Request, res: Response) => {
  try {
    const {
      userId,
      type,
      status,
      startDate,
      endDate,
      limit = '100',
      offset = '0',
    } = req.query;

    const where: any = {};

    if (userId) where.userId = userId as string;
    if (type) where.type = type as string;
    if (status) where.status = status as string;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) where.createdAt.lte = new Date(endDate as string);
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
    });

    const total = await prisma.transaction.count({ where });

    // Calculate totals by type
    const summary = await prisma.transaction.groupBy({
      by: ['type', 'status'],
      where,
      _sum: {
        amount: true,
      },
      _count: true,
    });

    res.json({
      transactions,
      total,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
      summary,
    });
  } catch (error: any) {
    console.error('Admin get transactions error:', error);
    res.status(500).json({ error: error.message || 'Failed to get transactions' });
  }
});

/**
 * GET /admin/payment-orders
 * Get all payment orders for audit
 */
router.get('/payment-orders', async (req: Request, res: Response) => {
  try {
    const {
      userId,
      status,
      provider,
      startDate,
      endDate,
      limit = '100',
      offset = '0',
    } = req.query;

    const where: any = {};

    if (userId) where.userId = userId as string;
    if (status) where.status = status as string;
    if (provider) where.provider = provider as string;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) where.createdAt.lte = new Date(endDate as string);
    }

    const orders = await prisma.paymentOrder.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
    });

    const total = await prisma.paymentOrder.count({ where });

    // Calculate statistics
    const stats = await prisma.paymentOrder.groupBy({
      by: ['status', 'provider'],
      where,
      _sum: {
        amount: true,
        diamonds: true,
      },
      _count: true,
    });

    res.json({
      orders,
      total,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
      stats,
    });
  } catch (error: any) {
    console.error('Admin get payment orders error:', error);
    res.status(500).json({ error: error.message || 'Failed to get payment orders' });
  }
});

/**
 * GET /admin/gifts
 * Get all gifts for audit
 */
router.get('/gifts', async (req: Request, res: Response) => {
  try {
    const {
      giverId,
      receiverId,
      callId,
      startDate,
      endDate,
      limit = '100',
      offset = '0',
    } = req.query;

    const where: any = {};

    if (giverId) where.giverId = giverId as string;
    if (receiverId) where.receiverId = receiverId as string;
    if (callId) where.callId = callId as string;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) where.createdAt.lte = new Date(endDate as string);
    }

    const gifts = await prisma.gift.findMany({
      where,
      include: {
        giver: {
          select: {
            id: true,
            username: true,
          },
        },
        receiver: {
          select: {
            id: true,
            username: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
    });

    const total = await prisma.gift.count({ where });

    // Calculate gift statistics
    const stats = await prisma.gift.groupBy({
      by: ['giftType'],
      where,
      _sum: {
        diamondValue: true,
      },
      _count: true,
    });

    res.json({
      gifts,
      total,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
      stats,
    });
  } catch (error: any) {
    console.error('Admin get gifts error:', error);
    res.status(500).json({ error: error.message || 'Failed to get gifts' });
  }
});

/**
 * GET /admin/users/:userId/ledger
 * Get complete financial ledger for a user
 */
router.get('/users/:userId/ledger', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        diamonds: true,
        wallet: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const dateFilter: any = {};
    if (startDate || endDate) {
      if (startDate) dateFilter.gte = new Date(startDate as string);
      if (endDate) dateFilter.lte = new Date(endDate as string);
    }

    // Get all transactions
    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        ...(startDate || endDate ? { createdAt: dateFilter } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get all payment orders
    const paymentOrders = await prisma.paymentOrder.findMany({
      where: {
        userId,
        ...(startDate || endDate ? { createdAt: dateFilter } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get gifts given
    const giftsGiven = await prisma.gift.findMany({
      where: {
        giverId: userId,
        ...(startDate || endDate ? { createdAt: dateFilter } : {}),
      },
      include: {
        receiver: {
          select: {
            username: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get gifts received
    const giftsReceived = await prisma.gift.findMany({
      where: {
        receiverId: userId,
        ...(startDate || endDate ? { createdAt: dateFilter } : {}),
      },
      include: {
        giver: {
          select: {
            username: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get withdrawals
    const withdrawals = await prisma.withdrawal.findMany({
      where: {
        userId,
        ...(startDate || endDate ? { createdAt: dateFilter } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate totals
    const totalPurchased = paymentOrders
      .filter((o) => o.status === 'SUCCESS')
      .reduce((sum, o) => sum + o.diamonds, 0);

    const totalGiftsSent = giftsGiven.reduce((sum, g) => sum + g.diamondValue, 0);
    const totalGiftsReceived = giftsReceived.reduce((sum, g) => sum + g.diamondValue, 0);
    const totalWithdrawn = withdrawals
      .filter((w) => w.status === 'COMPLETED')
      .reduce((sum, w) => sum + w.diamonds, 0);

    res.json({
      user,
      ledger: {
        transactions,
        paymentOrders,
        giftsGiven,
        giftsReceived,
        withdrawals,
      },
      summary: {
        currentBalance: user.diamonds,
        totalPurchased,
        totalGiftsSent,
        totalGiftsReceived,
        totalWithdrawn,
        netFlow: totalPurchased + totalGiftsReceived - totalGiftsSent - totalWithdrawn,
      },
    });
  } catch (error: any) {
    console.error('Admin get ledger error:', error);
    res.status(500).json({ error: error.message || 'Failed to get ledger' });
  }
});

/**
 * GET /admin/stats
 * Get platform-wide statistics
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter: any = {};
    if (startDate || endDate) {
      if (startDate) dateFilter.gte = new Date(startDate as string);
      if (endDate) dateFilter.lte = new Date(endDate as string);
    }

    // Total users
    const totalUsers = await prisma.user.count();

    // Total diamonds in circulation
    const totalDiamonds = await prisma.user.aggregate({
      _sum: {
        diamonds: true,
      },
    });

    // Payment orders stats
    const paymentStats = await prisma.paymentOrder.groupBy({
      by: ['status'],
      ...(startDate || endDate ? { where: { createdAt: dateFilter } } : {}),
      _sum: {
        amount: true,
        diamonds: true,
      },
      _count: true,
    });

    // Gift stats
    const giftStats = await prisma.gift.aggregate({
      ...(startDate || endDate ? { where: { createdAt: dateFilter } } : {}),
      _sum: {
        diamondValue: true,
      },
      _count: true,
    });

    // Transaction stats by type
    const transactionStats = await prisma.transaction.groupBy({
      by: ['type', 'status'],
      ...(startDate || endDate ? { where: { createdAt: dateFilter } } : {}),
      _sum: {
        amount: true,
      },
      _count: true,
    });

    res.json({
      platform: {
        totalUsers,
        totalDiamondsInCirculation: totalDiamonds._sum.diamonds || 0,
      },
      payments: paymentStats,
      gifts: {
        total: giftStats._count,
        totalValue: giftStats._sum.diamondValue || 0,
      },
      transactions: transactionStats,
    });
  } catch (error: any) {
    console.error('Admin get stats error:', error);
    res.status(500).json({ error: error.message || 'Failed to get stats' });
  }
});

export default router;
