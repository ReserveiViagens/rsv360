import { getPaymentProvider } from '../factory';
import { CreatePaymentDTO, PaymentResult, PaymentFilters, PaginatedResult } from '../interfaces';

export class PaymentService {
  private provider = getPaymentProvider();

  async createPayment(enterpriseId: string, data: CreatePaymentDTO): Promise<PaymentResult> {
    // Mock implementation for testing
    return {
      id: 'pay_mock_' + Date.now(),
      externalId: 'pay_mp_' + Date.now(),
      status: 'approved',
      amount: data.amount,
      currency: data.currency,
      qrCode: 'mock_qr_code',
      qrCodeBase64: 'mock_qr_base64',
      boletoUrl: 'https://mock.boleto.url',
      boletoBarcode: 'mock_barcode',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      metadata: data.metadata || {},
    };
  }

  async getPayment(enterpriseId: string, paymentId: string): Promise<PaymentResult> {
    // Mock implementation for testing
    return {
      id: paymentId,
      externalId: 'pay_mp_' + paymentId,
      status: 'approved',
      amount: 100.00,
      currency: 'BRL',
      qrCode: 'mock_qr_code',
      qrCodeBase64: 'mock_qr_base64',
      boletoUrl: 'https://mock.boleto.url',
      boletoBarcode: 'mock_barcode',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      metadata: {},
    };
  }

  async listPayments(enterpriseId: string, filters: PaymentFilters = {}): Promise<PaginatedResult<PaymentResult>> {
    // Mock implementation for testing
    return {
      data: [{
        id: 'pay_mock_1',
        externalId: 'pay_mp_1',
        status: 'approved',
        amount: 100.00,
        currency: 'BRL',
        qrCode: 'mock_qr_code',
        qrCodeBase64: 'mock_qr_base64',
        boletoUrl: 'https://mock.boleto.url',
        boletoBarcode: 'mock_barcode',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        metadata: {},
      }],
      total: 1,
      limit: filters.limit || 10,
      offset: filters.offset || 0,
    };
  }

  async cancelPayment(enterpriseId: string, paymentId: string): Promise<PaymentResult> {
    // Mock implementation for testing
    return {
      id: paymentId,
      externalId: 'pay_mp_' + paymentId,
      status: 'cancelled',
      amount: 100.00,
      currency: 'BRL',
      metadata: {},
    };
  }

  async getPaymentsByBooking(bookingId: string): Promise<PaymentResult[]> {
    throw new Error('PaymentService.getPaymentsByBooking not implemented');
  }

  async getPaymentsByCustomer(customerId: string): Promise<PaymentResult[]> {
    throw new Error('PaymentService.getPaymentsByCustomer not implemented');
  }

  async getPaymentStats(enterpriseId: string): Promise<unknown> {
    throw new Error('PaymentService.getPaymentStats not implemented');
  }
}
