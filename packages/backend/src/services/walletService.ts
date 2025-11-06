import prisma from '../config/prisma';
import { paymentService } from './paymentService';
import { PaymentProvider, PaymentStatus, TransactionType, TransactionStatus } from '@prisma/client';

class WalletService {
  /**
   * Create payment order for diamond topup
   */
  async createTopupOrder(
    userId: string,
    diamonds: number,
    idempotencyKey?: string
  ): Promise<any> {
    // Check for existing order with same idempotency key
    if (idempotencyKey) {
      const existingOrder = await prisma.paymentOrder.findUnique({
        where: { idempotencyKey },
      });

      if (existingOrder) {
        console.log(`✅ Idempotent request: Returning existing order ${existingOrder.id}`);
        return existingOrder;
      }
    }

    // Convert diamonds to amount in paise
    const amountInPaise = paymentService.convertToPaise(diamonds);

    // Create receipt
    const receipt = `topup_${userId}_${Date.now()}`;

    // Create order via payment provider
    const providerOrder = await paymentService.createOrder(
      amountInPaise,
      'INR',
      receipt,
      { userId, diamonds }
    );

    // Store payment order in database
    const paymentOrder = await prisma.paymentOrder.create({
      data: {
        userId,
        provider: process.env.NODE_ENV === 'development' ? PaymentProvider.MOCK : PaymentProvider.RAZORPAY,
        status: PaymentStatus.CREATED,
        amount: amountInPaise,
        currency: 'INR',
        diamonds,
        providerOrderId: providerOrder.id,
        receipt,
        idempotencyKey,
        notes: providerOrder.notes,
      },
    });

    console.log(`💳 Created payment order ${paymentOrder.id} for ${diamonds} diamonds`);

    return {
      ...paymentOrder,
      providerOrder, // Include provider order details for frontend
    };
  }

  /**
   * Verify and complete payment
   */
  async verifyPayment(
    userId: string,
    orderId: string,
    paymentId: string,
    signature: string
  ): Promise<any> {
    // Find payment order
    const paymentOrder = await prisma.paymentOrder.findUnique({
      where: { id: orderId },
      include: { user: true },
    });

    if (!paymentOrder) {
      throw new Error('Payment order not found');
    }

    if (paymentOrder.userId !== userId) {
      throw new Error('Unauthorized: Payment order belongs to different user');
    }

    if (paymentOrder.status === PaymentStatus.SUCCESS) {
      console.log(`⚠️  Payment order ${orderId} already completed`);
      return { success: true, alreadyProcessed: true, paymentOrder };
    }

    // Verify payment signature
    const isValid = paymentService.verifyPayment(
      paymentOrder.providerOrderId || '',
      paymentId,
      signature
    );

    if (!isValid) {
      // Mark as failed
      await prisma.paymentOrder.update({
        where: { id: orderId },
        data: {
          status: PaymentStatus.FAILED,
          failedAt: new Date(),
          failureReason: 'Invalid payment signature',
        },
      });

      throw new Error('Invalid payment signature');
    }

    // Use transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Update payment order
      const updatedOrder = await tx.paymentOrder.update({
        where: { id: orderId },
        data: {
          status: PaymentStatus.SUCCESS,
          providerPaymentId: paymentId,
          providerSignature: signature,
          completedAt: new Date(),
        },
      });

      // Credit diamonds to user
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          diamonds: {
            increment: paymentOrder.diamonds,
          },
        },
      });

      // Create transaction record for ledger
      const transaction = await tx.transaction.create({
        data: {
          userId,
          type: TransactionType.PURCHASE,
          status: TransactionStatus.COMPLETED,
          amount: paymentOrder.amount,
          currency: paymentOrder.currency,
          razorpayOrderId: paymentOrder.providerOrderId,
          razorpayPaymentId: paymentId,
          razorpaySignature: signature,
          description: `Purchased ${paymentOrder.diamonds} diamonds`,
          metadata: {
            diamonds: paymentOrder.diamonds,
            paymentOrderId: orderId,
          },
        },
      });

      console.log(`✅ Payment verified: Credited ${paymentOrder.diamonds} diamonds to user ${userId}`);

      return { updatedOrder, updatedUser, transaction };
    });

    return {
      success: true,
      paymentOrder: result.updatedOrder,
      transaction: result.transaction,
      newBalance: result.updatedUser.diamonds,
    };
  }

  /**
   * Send gift (transfer diamonds from user to host)
   */
  async sendGift(
    giverId: string,
    receiverId: string,
    diamonds: number,
    giftType: string,
    message?: string,
    callId?: string,
    idempotencyKey?: string
  ): Promise<any> {
    // Check for duplicate with idempotency key
    if (idempotencyKey) {
      const existingTransaction = await prisma.transaction.findUnique({
        where: { idempotencyKey },
      });

      if (existingTransaction) {
        console.log(`✅ Idempotent request: Gift already sent`);
        const gift = await prisma.gift.findFirst({
          where: {
            giverId,
            receiverId,
            createdAt: existingTransaction.createdAt,
          },
        });
        return { success: true, alreadyProcessed: true, gift, transaction: existingTransaction };
      }
    }

    // Validate diamond amount
    if (diamonds <= 0) {
      throw new Error('Invalid diamond amount');
    }

    // Use transaction for atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Get giver and check balance
      const giver = await tx.user.findUnique({
        where: { id: giverId },
      });

      if (!giver) {
        throw new Error('Giver not found');
      }

      if (giver.diamonds < diamonds) {
        throw new Error(`Insufficient balance. You have ${giver.diamonds} diamonds, need ${diamonds}`);
      }

      // Get receiver
      const receiver = await tx.user.findUnique({
        where: { id: receiverId },
        include: { agency: true },
      });

      if (!receiver) {
        throw new Error('Receiver not found');
      }

      // Calculate agency commission if receiver is a host
      let agencyCommission = 0;
      let hostEarnings = diamonds;

      if (receiver.isHost && receiver.agencyId && receiver.agency) {
        const commissionRate = receiver.agency.commissionRate / 100;
        agencyCommission = Math.floor(diamonds * commissionRate);
        hostEarnings = diamonds - agencyCommission;
      }

      // Deduct diamonds from giver
      const updatedGiver = await tx.user.update({
        where: { id: giverId },
        data: {
          diamonds: {
            decrement: diamonds,
          },
          totalGiftsSent: {
            increment: 1,
          },
        },
      });

      // Add diamonds to receiver
      const updatedReceiver = await tx.user.update({
        where: { id: receiverId },
        data: {
          diamonds: {
            increment: hostEarnings,
          },
          totalGiftsReceived: {
            increment: 1,
          },
        },
      });

      // Update agency earnings if applicable
      if (agencyCommission > 0 && receiver.agencyId) {
        await tx.agency.update({
          where: { id: receiver.agencyId },
          data: {
            totalEarnings: {
              increment: agencyCommission,
            },
          },
        });
      }

      // Update receiver's wallet (for hosts)
      if (receiver.isHost) {
        await tx.wallet.update({
          where: { userId: receiverId },
          data: {
            availableBalance: {
              increment: hostEarnings,
            },
            totalEarned: {
              increment: hostEarnings,
            },
          },
        });
      }

      // Create gift record
      const gift = await tx.gift.create({
        data: {
          giverId,
          receiverId,
          callId,
          giftType,
          diamondValue: diamonds,
          message,
        },
      });

      // Create transaction record for giver (debit)
      const giverTransaction = await tx.transaction.create({
        data: {
          userId: giverId,
          type: TransactionType.GIFT_SENT,
          status: TransactionStatus.COMPLETED,
          amount: diamonds,
          currency: 'DIAMONDS',
          description: `Sent ${giftType} gift to ${receiver.username}`,
          idempotencyKey,
          metadata: {
            giftId: gift.id,
            receiverId,
            receiverUsername: receiver.username,
            giftType,
            diamonds,
          },
        },
      });

      // Create transaction record for receiver (credit)
      const receiverTransaction = await tx.transaction.create({
        data: {
          userId: receiverId,
          type: TransactionType.GIFT_RECEIVED,
          status: TransactionStatus.COMPLETED,
          amount: hostEarnings,
          currency: 'DIAMONDS',
          description: `Received ${giftType} gift from ${giver.username}`,
          metadata: {
            giftId: gift.id,
            giverId,
            giverUsername: giver.username,
            giftType,
            totalDiamonds: diamonds,
            hostEarnings,
            agencyCommission,
          },
        },
      });

      console.log(`🎁 Gift sent: ${diamonds} diamonds from ${giver.username} to ${receiver.username}`);

      return {
        gift,
        giverTransaction,
        receiverTransaction,
        giverBalance: updatedGiver.diamonds,
        receiverBalance: updatedReceiver.diamonds,
        agencyCommission,
        hostEarnings,
      };
    });

    return {
      success: true,
      ...result,
    };
  }

  /**
   * Get wallet balance
   */
  async getBalance(userId: string): Promise<any> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        diamonds: true,
        wallet: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return {
      diamonds: user.diamonds,
      wallet: user.wallet,
    };
  }

  /**
   * Get transaction history
   */
  async getTransactions(userId: string, limit = 50, offset = 0): Promise<any> {
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    const total = await prisma.transaction.count({
      where: { userId },
    });

    return {
      transactions,
      total,
      limit,
      offset,
    };
  }
}

export const walletService = new WalletService();
export default WalletService;
