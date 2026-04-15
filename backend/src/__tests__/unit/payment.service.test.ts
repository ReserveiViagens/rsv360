import { PaymentService } from '../../../server/modules/payments/services/payment.service';

describe('PaymentService', () => {
  it('cria pagamento com metadados preservados', async () => {
    const service = new PaymentService();

    const result = await service.createPayment('ent_1', {
      amount: 123.45,
      currency: 'BRL',
      customerId: 'cus_1',
      paymentMethod: 'pix',
      metadata: { source: 'test' },
    });

    expect(result.status).toBe('approved');
    expect(result.amount).toBe(123.45);
    expect(result.metadata).toEqual({ source: 'test' });
  });

  it('lista pagamentos com limit/offset padrão', async () => {
    const service = new PaymentService();
    const result = await service.listPayments('ent_1');

    expect(result.total).toBe(1);
    expect(result.limit).toBe(10);
    expect(result.offset).toBe(0);
  });
});
