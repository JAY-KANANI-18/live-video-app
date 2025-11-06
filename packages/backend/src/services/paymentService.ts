import Razorpay from 'razorpay';
import crypto from 'crypto';

// Payment Provider Interface
interface PaymentProvider {
  createOrder(amount: number, currency: string, receipt: string, notes?: any): Promise<any>;
  verifyPayment(orderId: string, paymentId: string, signature: string): boolean;
}

// Razorpay Implementation
class RazorpayProvider implements PaymentProvider {
  private razorpay: Razorpay;

  constructor() {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || '',
      key_secret: process.env.RAZORPAY_KEY_SECRET || '',
    });
  }

  async createOrder(amount: number, currency: string, receipt: string, notes?: any): Promise<any> {
    const options = {
      amount: amount, // amount in smallest currency unit (paise)
      currency: currency,
      receipt: receipt,
      notes: notes || {},
    };

    const order = await this.razorpay.orders.create(options);
    return order;
  }

  verifyPayment(orderId: string, paymentId: string, signature: string): boolean {
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    return expectedSignature === signature;
  }
}

// Stripe Implementation (placeholder)
class StripeProvider implements PaymentProvider {
  async createOrder(amount: number, currency: string, receipt: string, notes?: any): Promise<any> {
    // TODO: Implement Stripe integration
    throw new Error('Stripe integration not implemented yet');
  }

  verifyPayment(orderId: string, paymentId: string, signature: string): boolean {
    // TODO: Implement Stripe verification
    throw new Error('Stripe integration not implemented yet');
  }
}

// Mock Provider for Development
class MockProvider implements PaymentProvider {
  async createOrder(amount: number, currency: string, receipt: string, notes?: any): Promise<any> {
    // Simulate order creation
    const orderId = `mock_order_${Date.now()}`;
    const paymentId = `mock_pay_${Date.now()}`;

    return {
      id: orderId,
      entity: 'order',
      amount: amount,
      currency: currency,
      receipt: receipt,
      status: 'created',
      notes: notes,
      // Mock data for testing
      mockPaymentId: paymentId,
      mockSignature: this.generateMockSignature(orderId, paymentId),
    };
  }

  verifyPayment(orderId: string, paymentId: string, signature: string): boolean {
    // In dev mode, always return true for mock signatures
    const expectedSignature = this.generateMockSignature(orderId, paymentId);
    return signature === expectedSignature || signature === 'mock_signature';
  }

  private generateMockSignature(orderId: string, paymentId: string): string {
    return crypto
      .createHmac('sha256', 'mock_secret')
      .update(`${orderId}|${paymentId}`)
      .digest('hex');
  }
}

// Payment Service Factory
class PaymentService {
  private provider: PaymentProvider;

  constructor(providerName: 'razorpay' | 'stripe' | 'mock' = 'mock') {
    const isDev = process.env.NODE_ENV === 'development';

    // Force mock in development
    if (isDev) {
      this.provider = new MockProvider();
      console.log('💳 Payment Service: Using MOCK provider (development mode)');
    } else if (providerName === 'razorpay') {
      this.provider = new RazorpayProvider();
      console.log('💳 Payment Service: Using Razorpay provider');
    } else if (providerName === 'stripe') {
      this.provider = new StripeProvider();
      console.log('💳 Payment Service: Using Stripe provider');
    } else {
      this.provider = new MockProvider();
      console.log('💳 Payment Service: Using MOCK provider');
    }
  }

  async createOrder(amount: number, currency: string, receipt: string, notes?: any): Promise<any> {
    return await this.provider.createOrder(amount, currency, receipt, notes);
  }

  verifyPayment(orderId: string, paymentId: string, signature: string): boolean {
    return this.provider.verifyPayment(orderId, paymentId, signature);
  }

  // Convert INR to diamonds (1 INR = 10 diamonds for example)
  convertToDiamonds(amountInPaise: number): number {
    const amountInINR = amountInPaise / 100;
    return Math.floor(amountInINR * 10); // 1 INR = 10 diamonds
  }

  // Convert diamonds to INR (in paise)
  convertToPaise(diamonds: number): number {
    const amountInINR = diamonds / 10; // 10 diamonds = 1 INR
    return Math.floor(amountInINR * 100); // Convert to paise
  }
}

export const paymentService = new PaymentService(
  (process.env.PAYMENT_PROVIDER as 'razorpay' | 'stripe' | 'mock') || 'mock'
);

export default PaymentService;
