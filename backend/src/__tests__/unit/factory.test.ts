import { getPaymentProvider, getPIXProvider, getSubscriptionProvider } from '../../../server/modules/payments/factory';

describe('Payments Factory', () => {
  it('retorna provider de pagamento configurado', () => {
    process.env.PAYMENT_PROVIDER = 'mercadopago';
    const provider = getPaymentProvider();

    expect(provider.name).toBe('mercadopago');
  });

  it('retorna provider de assinatura configurado', () => {
    process.env.SUBSCRIPTION_PROVIDER = 'mercadopago';
    const provider = getSubscriptionProvider();

    expect(provider.name).toBe('mercadopago');
  });

  it('retorna provider PIX com interface esperada', () => {
    process.env.PIX_PROVIDER = 'mercadopago';
    const provider = getPIXProvider();

    expect(provider.name).toBe('mercadopago');
  });
});
