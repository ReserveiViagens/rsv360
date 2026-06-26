import { ofertaSchema } from '../../../../server/modules/fornecedores-hub/schema';
import { buscarComFornecedores, withTimeout } from '../../../../server/modules/fornecedores-hub/hub';
import {
  getAdapterFactory,
  limparRegistry,
  registrarAdapterFactory,
} from '../../../../server/modules/fornecedores-hub/registry';

describe('fornecedores-hub — hub', () => {
  beforeEach(() => {
    limparRegistry();
  });

  it('withTimeout rejeita promise lenta', async () => {
    await expect(
      withTimeout(new Promise<string>((resolve) => setTimeout(() => resolve('ok'), 200)), 50),
    ).rejects.toThrow('timeout');
  });

  it('buscarComFornecedores não trava quando um fornecedor é lento', async () => {
    registrarAdapterFactory('rapido', () => ({
      nome: 'rapido',
      buscar: async () => [
        {
          fornecedor: 'rapido',
          tipo: 'hospedagem',
          titulo: 'Hotel Rápido',
          preco: 500,
          moeda: 'BRL',
          imagens: ['https://example.com/a.jpg'],
          descricao: 'ok',
          fonte: 'https://example.com/oferta',
          capturadoEm: new Date().toISOString(),
        },
      ],
    }));

    registrarAdapterFactory('lento', () => ({
      nome: 'lento',
      buscar: () => new Promise(() => {}),
    }));

    const ofertas = await buscarComFornecedores('Caldas Novas', {}, [
      {
        nome: 'Rápido',
        adapter: 'rapido',
        endpoint: 'https://example.com',
        apiKey: 'k1',
        timeoutMs: 3000,
      },
      {
        nome: 'Lento',
        adapter: 'lento',
        endpoint: 'https://example.com',
        apiKey: 'k2',
        timeoutMs: 80,
      },
    ]);

    expect(ofertas).toHaveLength(1);
    expect(ofertas[0].fornecedor).toBe('rapido');
    expect(getAdapterFactory('rapido')).toBeDefined();
  });
});

describe('fornecedores-hub — ofertaSchema', () => {
  it('descarta payload inválido (preço negativo)', () => {
    const parsed = ofertaSchema.safeParse({
      fornecedor: 'x',
      tipo: 'hospedagem',
      titulo: 'Hotel',
      preco: -10,
      moeda: 'BRL',
      imagens: ['https://example.com/i.jpg'],
      descricao: '',
      fonte: 'https://example.com',
      capturadoEm: new Date().toISOString(),
    });
    expect(parsed.success).toBe(false);
  });

  it('aceita payload válido', () => {
    const parsed = ofertaSchema.safeParse({
      fornecedor: 'trend',
      tipo: 'hospedagem',
      titulo: 'Hotel Test',
      preco: 1200,
      moeda: 'BRL',
      imagens: ['https://example.com/h.jpg'],
      descricao: 'desc',
      fonte: 'https://example.com/p',
      capturadoEm: new Date().toISOString(),
    });
    expect(parsed.success).toBe(true);
  });
});
