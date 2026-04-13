import { MercadoPagoConfig, Payment, MerchantOrder } from 'mercadopago';
import { PaymentProviderInterface, PIXProviderInterface, CreatePaymentDTO, PaymentResult, CreateRefundDTO, RefundResult, PaymentFilters, PaginatedResult, CreatePIXDTO } from '../interfaces';

export class MercadoPagoProvider implements PaymentProviderInterface, PIXProviderInterface {
  name = 'mercadopago';
  private client: MercadoPagoConfig;

  constructor() {
    this.client = new MercadoPagoConfig({
      accessToken: process.env.MP_ACCESS_TOKEN!,
      options: { timeout: 5000 }
    });
  }

  async createPayment(data: CreatePaymentDTO): Promise<PaymentResult> {
    // Implementation for creating payment
    const payment = new Payment(this.client);
    
    const paymentData = {
      transaction_amount: data.amount,
      description: data.description,
      payment_method_id: this.mapPaymentMethod(data.paymentMethod),
      payer: {
        email: 'customer@example.com', // Get from customer data
      },
      installments: data.installments || 1,
      metadata: data.metadata,
    };

    const result = await payment.create({ body: paymentData });

    return {
      id: result.id!.toString(),
      externalId: result.id!.toString(),
      status: this.mapStatus(result.status || 'pending'),
      amount: result.transaction_amount!,
      currency: result.currency_id || 'BRL',
      qrCode: result.point_of_interaction?.transaction_data?.qr_code,
      qrCodeBase64: result.point_of_interaction?.transaction_data?.qr_code_base64,
      boletoUrl: result.transaction_details?.external_resource_url,
      boletoBarcode: result.transaction_details?.barcode?.content,
      expiresAt: result.date_of_expiration ? new Date(result.date_of_expiration) : undefined,
      metadata: result.metadata,
    };
  }

  async getPayment(externalId: string): Promise<PaymentResult> {
    const payment = new Payment(this.client);
    const result = await payment.get({ id: externalId });

    return {
      id: result.id!.toString(),
      externalId: result.id!.toString(),
      status: this.mapStatus(result.status || 'pending'),
      amount: result.transaction_amount!,
      currency: result.currency_id || 'BRL',
      qrCode: result.point_of_interaction?.transaction_data?.qr_code,
      qrCodeBase64: result.point_of_interaction?.transaction_data?.qr_code_base64,
      boletoUrl: result.transaction_details?.external_resource_url,
      boletoBarcode: result.transaction_details?.barcode?.content,
      expiresAt: result.date_of_expiration ? new Date(result.date_of_expiration) : undefined,
      metadata: result.metadata,
    };
  }

  async cancelPayment(externalId: string): Promise<PaymentResult> {
    const payment = new Payment(this.client);
    const result = await payment.cancel({ id: externalId });

    return {
      id: result.id!.toString(),
      externalId: result.id!.toString(),
      status: this.mapStatus(result.status || 'cancelled'),
      amount: result.transaction_amount!,
      currency: result.currency_id || 'BRL',
      metadata: result.metadata,
    };
  }

  async createRefund(data: CreateRefundDTO): Promise<RefundResult> {
    // Mercado Pago SDK may not have refund support in current version
    // This would need to be implemented using direct API calls
    throw new Error('Refund not implemented for Mercado Pago provider');
  }

  async listPayments(filters: PaymentFilters): Promise<PaginatedResult<PaymentResult>> {
    // Implementation for listing payments
    // This would use MerchantOrder or search payments
    return {
      data: [],
      total: 0,
      limit: filters.limit || 10,
      offset: filters.offset || 0,
    };
  }

  verifyWebhookSignature(payload: string | Buffer, signature: string): boolean {
    // HMAC SHA256 verification
    // Implementation needed
    return true; // Placeholder
  }

  // PIXProviderInterface
  async createPIXCharge(data: CreatePIXDTO): Promise<any> {
    return this.createPayment({
      ...data,
      paymentMethod: 'pix',
      currency: 'BRL',
    });
  }

  async getPIXCharge(externalId: string): Promise<any> {
    return this.getPayment(externalId);
  }

  async cancelPIXCharge(externalId: string): Promise<any> {
    return this.cancelPayment(externalId);
  }

  async generateQRCode(pixCode: string): Promise<string> {
    // Use qrcode package
    const QRCode = require('qrcode');
    return await QRCode.toDataURL(pixCode);
  }

  private mapPaymentMethod(method: string): string {
    switch (method) {
      case 'credit_card': return 'visa'; // or detect from card
      case 'pix': return 'pix';
      case 'boleto': return 'bolbradesco'; // or other
      default: return method;
    }
  }

  private mapStatus(status: string): string {
    switch (status) {
      case 'approved': return 'approved';
      case 'pending': return 'pending';
      case 'in_process': return 'processing';
      case 'rejected': return 'rejected';
      case 'cancelled': return 'cancelled';
      case 'refunded': return 'refunded';
      case 'charged_back': return 'charged_back';
      default: return 'pending';
    }
  }
}