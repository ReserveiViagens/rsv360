import * as Stripe from 'stripe';
import { PaymentProviderInterface, CreatePaymentDTO, PaymentResult, CreateRefundDTO, RefundResult, PaymentFilters, PaginatedResult } from '../interfaces';

export class StripeProvider implements PaymentProviderInterface {
  name = 'stripe';
  private client: any;

  constructor() {
    this.client = new Stripe(process.env.STRIPE_SECRET_KEY!);
  }

  async createPayment(data: CreatePaymentDTO): Promise<PaymentResult> {
    const paymentIntent = await this.client.paymentIntents.create({
      amount: Math.round(data.amount * 100), // Stripe uses cents
      currency: data.currency.toLowerCase(),
      description: data.description,
      payment_method_types: this.mapPaymentMethod(data.paymentMethod),
      metadata: data.metadata,
    });

    return {
      id: paymentIntent.id,
      externalId: paymentIntent.id,
      status: this.mapStatus(paymentIntent.status),
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency.toUpperCase(),
      metadata: paymentIntent.metadata,
    };
  }

  async getPayment(externalId: string): Promise<PaymentResult> {
    const paymentIntent = await this.client.paymentIntents.retrieve(externalId);

    return {
      id: paymentIntent.id,
      externalId: paymentIntent.id,
      status: this.mapStatus(paymentIntent.status),
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency.toUpperCase(),
      metadata: paymentIntent.metadata,
    };
  }

  async cancelPayment(externalId: string): Promise<PaymentResult> {
    const paymentIntent = await this.client.paymentIntents.cancel(externalId);

    return {
      id: paymentIntent.id,
      externalId: paymentIntent.id,
      status: this.mapStatus(paymentIntent.status),
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency.toUpperCase(),
      metadata: paymentIntent.metadata,
    };
  }

  async createRefund(data: CreateRefundDTO): Promise<RefundResult> {
    const refund = await this.client.refunds.create({
      payment_intent: data.paymentId,
      amount: Math.round(data.amount * 100),
      reason: data.reason,
      metadata: data.metadata,
    });

    return {
      id: refund.id,
      externalId: refund.id,
      status: refund.status === 'succeeded' ? 'approved' : 'pending',
      amount: refund.amount / 100,
      processedAt: new Date(refund.created * 1000),
      metadata: refund.metadata,
    };
  }

  async listPayments(filters: PaymentFilters): Promise<PaginatedResult<PaymentResult>> {
    const params: any = {
      limit: filters.limit || 10,
    };

    if (filters.customerId) {
      params.customer = filters.customerId;
    }

    const result = await this.client.paymentIntents.list(params);

    const data = result.data.map(pi => ({
      id: pi.id,
      externalId: pi.id,
      status: this.mapStatus(pi.status),
      amount: pi.amount / 100,
      currency: pi.currency.toUpperCase(),
      metadata: pi.metadata,
    }));

    return {
      data,
      total: result.data.length, // Stripe doesn't provide total count easily
      limit: params.limit!,
      offset: 0,
    };
  }

  verifyWebhookSignature(payload: string | Buffer, signature: string): boolean {
    try {
      this.client.webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET!);
      return true;
    } catch (err) {
      return false;
    }
  }

  private mapPaymentMethod(method: string): string[] {
    switch (method) {
      case 'credit_card': return ['card'];
      case 'boleto': return ['boleto'];
      case 'pix': return ['pix']; // If supported
      default: return ['card'];
    }
  }

  private mapStatus(status: string): string {
    switch (status) {
      case 'succeeded': return 'approved';
      case 'processing': return 'processing';
      case 'requires_payment_method': return 'pending';
      case 'canceled': return 'cancelled';
      default: return 'pending';
    }
  }
}