const mockUpdateWhere = jest.fn().mockResolvedValue(undefined);
const mockUpdateSet = jest.fn(() => ({ where: mockUpdateWhere }));
const mockUpdate = jest.fn((..._args: unknown[]) => ({ set: mockUpdateSet }));

jest.mock('../../../../server/lib/db', () => ({
  db: {
    update: (...args: unknown[]) => mockUpdate(...args),
  },
}));

jest.mock('../../../../backend/src/db/schema/propostas', () => ({
  propostas: { id: 'id', validoAte: 'valido_ate', updatedAt: 'updated_at' },
}));

jest.mock('drizzle-orm', () => ({
  eq: (...args: unknown[]) => args,
}));

const mockCalcularValidoAte = jest.fn();
jest.mock('../../../../server/modules/cotacao-publica/services/calcular-valido-ate', () => ({
  calcularValidoAte: (...args: unknown[]) => mockCalcularValidoAte(...args),
}));

const mockAgendarExpiracao = jest.fn().mockResolvedValue(undefined);
const mockAgendarAvisoExpiracao = jest.fn().mockResolvedValue(undefined);
jest.mock('../../../../server/modules/propostas/propostas.queue', () => ({
  agendarExpiracao: (...args: unknown[]) => mockAgendarExpiracao(...args),
  agendarAvisoExpiracao: (...args: unknown[]) => mockAgendarAvisoExpiracao(...args),
}));

jest.mock('../../../../server/modules/configuracoes/config.service', () => ({
  ConfigService: {
    obterRegrasCotacao: jest.fn().mockResolvedValue({ avisoExpiracaoHoras: 2 }),
  },
}));

import { aplicarValidadeProposta } from '../../../../server/modules/propostas/aplicar-validade-proposta';

describe('aplicarValidadeProposta', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCalcularValidoAte.mockResolvedValue(new Date('2026-06-24T12:00:00.000Z'));
  });

  it('grava valido_ate e agenda expiração + aviso', async () => {
    const validoAte = await aplicarValidadeProposta(42);

    expect(validoAte.toISOString()).toBe('2026-06-24T12:00:00.000Z');
    expect(mockUpdate).toHaveBeenCalled();
    expect(mockUpdateSet).toHaveBeenCalledWith(
      expect.objectContaining({
        validoAte: expect.any(Date),
        updatedAt: expect.any(Date),
      }),
    );
    expect(mockUpdateWhere).toHaveBeenCalled();
    expect(mockAgendarExpiracao).toHaveBeenCalledWith(42, validoAte);
    expect(mockAgendarAvisoExpiracao).toHaveBeenCalledWith(42, validoAte, 2);
  });

  it('retorna validoAte mesmo se a fila falhar', async () => {
    mockAgendarExpiracao.mockRejectedValueOnce(new Error('Redis indisponível'));

    const validoAte = await aplicarValidadeProposta(7);

    expect(validoAte.toISOString()).toBe('2026-06-24T12:00:00.000Z');
    expect(mockUpdate).toHaveBeenCalled();
  });
});
