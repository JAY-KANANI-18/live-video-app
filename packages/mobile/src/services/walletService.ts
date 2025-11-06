import apiClient from '../config/api';

export interface PaymentOrder {
  id: string;
  provider: string;
  status: string;
  amount: number;
  currency: string;
  diamonds: number;
  providerOrderId?: string;
  providerOrder?: any;
  createdAt: string;
}

export interface Transaction {
  id: string;
  type: string;
  status: string;
  amount: number;
  currency: string;
  description?: string;
  metadata?: any;
  createdAt: string;
}

export interface Gift {
  id: string;
  giftType: string;
  diamondValue: number;
  message?: string;
  createdAt: string;
}

export interface WalletBalance {
  diamonds: number;
  wallet?: {
    availableBalance: number;
    pendingBalance: number;
    totalEarned: number;
    totalWithdrawn: number;
  };
}

class WalletService {
  /**
   * Get wallet balance
   */
  async getBalance(): Promise<WalletBalance> {
    const response = await apiClient.get('/wallet/balance');
    return response.data;
  }

  /**
   * Create topup order
   */
  async createTopupOrder(diamonds: number, idempotencyKey?: string): Promise<PaymentOrder> {
    const response = await apiClient.post('/wallet/topup', {
      diamonds,
      idempotencyKey,
    });
    return response.data.order;
  }

  /**
   * Verify payment and credit diamonds
   */
  async verifyPayment(
    orderId: string,
    paymentId: string,
    signature: string
  ): Promise<any> {
    const response = await apiClient.post('/wallet/verify', {
      orderId,
      paymentId,
      signature,
    });
    return response.data;
  }

  /**
   * Send gift to another user
   */
  async sendGift(
    receiverId: string,
    diamonds: number,
    giftType: string,
    message?: string,
    callId?: string,
    idempotencyKey?: string
  ): Promise<any> {
    const response = await apiClient.post('/wallet/send-gift', {
      receiverId,
      diamonds,
      giftType,
      message,
      callId,
      idempotencyKey,
    });
    return response.data;
  }

  /**
   * Get transaction history
   */
  async getTransactions(limit = 50, offset = 0): Promise<{
    transactions: Transaction[];
    total: number;
  }> {
    const response = await apiClient.get('/wallet/transactions', {
      params: { limit, offset },
    });
    return response.data;
  }

  /**
   * Get payment order history
   */
  async getPaymentOrders(limit = 50, offset = 0): Promise<{
    orders: PaymentOrder[];
    total: number;
  }> {
    const response = await apiClient.get('/wallet/payment-orders', {
      params: { limit, offset },
    });
    return response.data;
  }

  /**
   * Convert diamonds to display amount (for UI)
   */
  diamondsToINR(diamonds: number): number {
    return diamonds / 10; // 10 diamonds = 1 INR
  }

  /**
   * Convert INR to diamonds
   */
  inrToDiamonds(inr: number): number {
    return Math.floor(inr * 10);
  }
}

export const walletService = new WalletService();
export default WalletService;
