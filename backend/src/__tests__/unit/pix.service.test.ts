import { PIXService } from '../../../server/modules/payments/services/pix.service';

describe('PIXService', () => {
  it('cria cobrança PIX com valor e descrição', async () => {
    const service = new PIXService();

    const result = await service.createPIXCharge('ent_1', {
      amount: 89.9,
      customerId: 'cus_1',
      description: 'Diária teste',
    });

    expect(result.status).toBe('pending');
    expect((result as any).amount).toBe(89.9);
    expect((result as any).description).toBe('Diária teste');
  });

  it('retorna status pendente para consulta', async () => {
    const service = new PIXService();
    const status = await service.checkPIXStatus('pix_1');

    expect(status).toBe('pending');
  });
});
