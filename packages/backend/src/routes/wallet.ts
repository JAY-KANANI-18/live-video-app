import { Router, Request, Response } from 'express';
import { walletService } from '../services/walletService';
import { requireAuth } from '../middleware/auth';
import prisma from '../config/prisma';

const router = Router();

/**
 * POST /wallet/topup
 * Create payment order for diamond topup
 */
router.post('/topup', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { diamonds, idempotencyKey } = req.body;

    // Validation
    if (!diamonds || diamonds <= 0) {
      return res.status(400).json({ error: 'Invalid diamond amount' });
    }

    if (diamonds > 100000) {
      return res.status(400).json({ error: 'Maximum 100,000 diamonds per transaction' });
    }

    const result = await walletService.createTopupOrder(userId, diamonds, idempotencyKey);

    res.status(201).json({
      message: 'Payment order created',
      order: result,
    });
  } catch (error: any) {
    console.error('Topup error:', error);
    res.status(500).json({ error: error.message || 'Failed to create topup order' });
  }
});

/**
 * POST /wallet/verify
 * Verify payment and credit diamonds
 */
router.post('/verify', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { orderId, paymentId, signature } = req.body;

    // Validation
    if (!orderId || !paymentId || !signature) {
      return res.status(400).json({ error: 'Missing required payment details' });
    }

    const result = await walletService.verifyPayment(userId, orderId, paymentId, signature);

    res.json({
      message: result.alreadyProcessed
        ? 'Payment already processed'
        : 'Payment verified and diamonds credited',
      ...result,
    });
  } catch (error: any) {
    console.error('Payment verification error:', error);
    res.status(400).json({ error: error.message || 'Payment verification failed' });
  }
});

/**
 * POST /wallet/send-gift
 * Send gift to another user (transfer diamonds)
 */
router.post('/send-gift', requireAuth, async (req: Request, res: Response) => {
  try {
    const giverId = req.user!.userId;
    const { receiverId, diamonds, giftType, message, callId, idempotencyKey } = req.body;

    // Validation
    if (!receiverId) {
      return res.status(400).json({ error: 'Receiver ID is required' });
    }

    if (!diamonds || diamonds <= 0) {
      return res.status(400).json({ error: 'Invalid diamond amount' });
    }

    if (!giftType) {
      return res.status(400).json({ error: 'Gift type is required' });
    }

    if (giverId === receiverId) {
      return res.status(400).json({ error: 'Cannot send gift to yourself' });
    }

    const result = await walletService.sendGift(
      giverId,
      receiverId,
      diamonds,
      giftType,
      message,
      callId,
      idempotencyKey
    );

    res.json({
      message: result.alreadyProcessed ? 'Gift already sent' : 'Gift sent successfully',
      ...result,
    });
  } catch (error: any) {
    console.error('Send gift error:', error);
    res.status(400).json({ error: error.message || 'Failed to send gift' });
  }
});

/**
 * GET /wallet/balance
 * Get current wallet balance
 */
router.get('/balance', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    const balance = await walletService.getBalance(userId);

    res.json({
      ...balance,
    });
  } catch (error: any) {
    console.error('Get balance error:', error);
    res.status(500).json({ error: error.message || 'Failed to get balance' });
  }
});

/**
 * GET /wallet/transactions
 * Get transaction history
 */
router.get('/transactions', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const result = await walletService.getTransactions(userId, limit, offset);

    res.json(result);
  } catch (error: any) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: error.message || 'Failed to get transactions' });
  }
});

/**
 * GET /wallet/payment-orders
 * Get payment order history
 */
router.get('/payment-orders', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const orders = await prisma.paymentOrder.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    const total = await prisma.paymentOrder.count({
      where: { userId },
    });

    res.json({
      orders,
      total,
      limit,
      offset,
    });
  } catch (error: any) {
    console.error('Get payment orders error:', error);
    res.status(500).json({ error: error.message || 'Failed to get payment orders' });
  }
});

export default router;
