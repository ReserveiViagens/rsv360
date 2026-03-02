/**
 * ✅ FASE 5.4: Payment Gateway Service
 * 
 * @description Serviço para processamento de pagamentos
 * - Stripe integration
 * - Mercado Pago integration
 * - Checkout sessions
 * - Payment processing
 * 
 * @module external
 * @author RSV 360 Team
 * @created 2025-12-13
 */

// ================================
// TYPES
// ================================

export interface PaymentRequest {
  amount: number;
  currency: string;
  destinationAccountId: string;
  description: string;
  metadata?: Record<string, any>;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  reference?: string;
  method: string;
  status: string;
  processedAt: Date;
  error?: string;
}

export interface CheckoutSessionRequest {
  amount: number;
  currency: string;
  items: Array<{
    name: string;
    description?: string;
    amount: number;
    quantity: number;
  }>;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, any>;
}

export interface CheckoutSessionResult {
  sessionId: string;
  url: string;
}

// ================================
// PAYMENT GATEWAY SERVICE
// ================================

class PaymentGatewayService {
  private provider: 'stripe' | 'mercadopago' = 'stripe';

  constructor() {
    // Determinar provider baseado em variável de ambiente
    this.provider = (process.env.PAYMENT_PROVIDER as 'stripe' | 'mercadopago') || 'stripe';
  }

  /**
   * Processar pagamento
   */
  async processPayment(payment: PaymentRequest): Promise<PaymentResult> {
    if (this.provider === 'stripe') {
      return await this.processStripePayment(payment);
    } else {
      return await this.processMercadoPagoPayment(payment);
    }
  }

  /**
   * Processar pagamento via Stripe
   */
  private async processStripePayment(payment: PaymentRequest): Promise<PaymentResult> {
    try {
      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

      if (!process.env.STRIPE_SECRET_KEY) {
        throw new Error('STRIPE_SECRET_KEY não configurada');
      }

      // Criar transferência
      const transfer = await stripe.transfers.create({
        amount: Math.round(payment.amount * 100), // Centavos
        currency: payment.currency.toLowerCase(),
        destination: payment.destinationAccountId,
        description: payment.description,
        metadata: payment.metadata || {},
      });

      return {
        success: true,
        transactionId: transfer.id,
        reference: transfer.balance_transaction,
        method: 'stripe',
        status: transfer.status,
        processedAt: new Date(transfer.created * 1000),
      };
    } catch (error: any) {
      console.error('Erro no pagamento Stripe:', error);

      return {
        success: false,
        method: 'stripe',
        status: 'failed',
        processedAt: new Date(),
        error: error.message || 'Erro ao processar pagamento',
      };
    }
  }

  /**
   * Processar pagamento via Mercado Pago
   */
  private async processMercadoPagoPayment(payment: PaymentRequest): Promise<PaymentResult> {
    try {
      if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
        throw new Error('MERCADOPAGO_ACCESS_TOKEN não configurada');
      }

      const mercadopago = require('mercadopago');
      mercadopago.configure({
        access_token: process.env.MERCADOPAGO_ACCESS_TOKEN,
      });

      const paymentData = {
        transaction_amount: payment.amount,
        description: payment.description,
        payment_method_id: 'pix',
        payer: {
          email: payment.destinationAccountId,
        },
        metadata: payment.metadata || {},
      };

      const result = await mercadopago.payment.create(paymentData);

      return {
        success: result.body.status === 'approved',
        transactionId: result.body.id.toString(),
        reference: result.body.external_reference,
        method: 'mercadopago',
        status: result.body.status,
        processedAt: new Date(),
      };
    } catch (error: any) {
      console.error('Erro no pagamento Mercado Pago:', error);

      return {
        success: false,
        method: 'mercadopago',
        status: 'failed',
        processedAt: new Date(),
        error: error.message || 'Erro ao processar pagamento',
      };
    }
  }

  /**
   * Criar checkout session (para pagamentos diretos)
   */
  async createCheckoutSession(
    data: CheckoutSessionRequest
  ): Promise<CheckoutSessionResult> {
    try {
      if (this.provider !== 'stripe') {
        throw new Error('Checkout session disponível apenas para Stripe');
      }

      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

      if (!process.env.STRIPE_SECRET_KEY) {
        throw new Error('STRIPE_SECRET_KEY não configurada');
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card', 'boleto'],
        line_items: data.items.map((item) => ({
          price_data: {
            currency: data.currency,
            product_data: {
              name: item.name,
              description: item.description,
            },
            unit_amount: Math.round(item.amount * 100),
          },
          quantity: item.quantity,
        })),
        mode: 'payment',
        success_url: data.successUrl,
        cancel_url: data.cancelUrl,
        metadata: data.metadata || {},
      });

      return {
        sessionId: session.id,
        url: session.url || '',
      };
    } catch (error: any) {
      console.error('Erro ao criar checkout session:', error);
      throw new Error(`Falha ao criar checkout session: ${error.message}`);
    }
  }
}

// Exportar instância singleton
export const paymentGatewayService = new PaymentGatewayService();
export default paymentGatewayService;

