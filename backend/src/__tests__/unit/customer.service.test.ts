import { CustomerService } from '../../../server/modules/payments/services/customer.service';

describe('CustomerService', () => {
  it('cria cliente com dados recebidos', async () => {
    const service = new CustomerService();

    const result = await service.createCustomer('ent_1', {
      email: 'qa@rsv360.com',
      name: 'Cliente QA',
    });

    expect(result.email).toBe('qa@rsv360.com');
    expect(result.name).toBe('Cliente QA');
    expect(result.id).toContain('cus_mock_');
  });

  it('atualiza cliente com fallback para campos ausentes', async () => {
    const service = new CustomerService();
    const result = await service.updateCustomer('cus_123', {});

    expect(result.id).toBe('cus_123');
    expect(result.email).toBe('updated@example.com');
  });
});
