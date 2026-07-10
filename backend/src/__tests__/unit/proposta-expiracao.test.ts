const mockReturning = jest.fn();
const mockWhere = jest.fn(() => ({ returning: mockReturning }));
const mockSet = jest.fn(() => ({ where: mockWhere }));
const mockUpdate = jest.fn(() => ({ set: mockSet }));

jest.mock('../../../../server/lib/db', () => ({
  db: {
    update: (...args: unknown[]) => mockUpdate(...args),
  },
}));

jest.mock('../../../../backend/src/db/schema/propostas', () => ({
  propostas: { id: 'id', status: 'status' },
}));

jest.mock('drizzle-orm', () => ({
  and: (...args: unknown[]) => args,
  eq: (...args: unknown[]) => args,
  notInArray: (...args: unknown[]) => args,
}));

jest.mock('../../../../server/modules/configuracoes/config.service', () => ({
  ConfigService: {
    obterRegrasCotacao: jest.fn().mockResolvedValue({ urgenciaEstilo: 'countdown' }),
  },
}));

import {
  marcarExpirada,
  PROPOSTA_STATUS_FECHADO,
  isValidoAteVencido,
  buildValidadePayload,
  isPropostaExpirada,
} from '../../../../server/modules/propostas/proposta-validade';

describe('proposta-validade — marcarExpirada (idempotência)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('não altera proposta já aceita (retorna null)', async () => {
    mockReturning.mockResolvedValue([]);

    const result = await marcarExpirada(42);

    expect(result).toBeNull();
    expect(mockUpdate).toHaveBeenCalled();
    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'expired' }),
    );
  });

  it('expira proposta aberta e retorna registro atualizado', async () => {
    const updated = {
      id: 7,
      status: 'expired',
      tokenPublico: 'rt-test-token',
    };
    mockReturning.mockResolvedValue([updated]);

    const result = await marcarExpirada(7);

    expect(result).toEqual(updated);
  });

  it('protege status fechados definidos em PROPOSTA_STATUS_FECHADO', () => {
    expect(PROPOSTA_STATUS_FECHADO).toEqual(
      expect.arrayContaining(['accepted', 'converted', 'paid', 'cancelled']),
    );
  });
});

describe('proposta-validade — isValidoAteVencido', () => {
  it('usa horário do servidor, não do cliente', () => {
    const validoAte = new Date('2026-06-22T12:00:00.000Z');
    const servidor = new Date('2026-06-22T12:00:01.000Z');
    expect(isValidoAteVencido(validoAte, servidor)).toBe(true);
    expect(isValidoAteVencido(validoAte, new Date('2026-06-22T11:59:59.000Z'))).toBe(false);
  });
});

describe('proposta-validade — abertura de proposta já vencida', () => {
  it('isPropostaExpirada detecta valido_ate no passado', () => {
    expect(
      isPropostaExpirada({
        status: 'sent',
        validoAte: new Date('2020-01-01T00:00:00.000Z'),
      }),
    ).toBe(true);
  });

  it('accepted com valido_ate vencido não é expirada comercialmente', () => {
    expect(
      isPropostaExpirada({
        status: 'accepted',
        validoAte: new Date('2020-01-01T00:00:00.000Z'),
      }),
    ).toBe(false);
  });

  it('buildValidadePayload devolve expirada e restanteMs zero', async () => {
    const payload = await buildValidadePayload({
      status: 'sent',
      validoAte: new Date('2020-01-01T00:00:00.000Z'),
    });

    expect(payload.expirada).toBe(true);
    expect(payload.restanteMs).toBe(0);
  });

  it('buildValidadePayload inclui urgenciaEstilo da config modulo_propostas', async () => {
    const payload = await buildValidadePayload({
      status: 'sent',
      validoAte: new Date(Date.now() + 60 * 60 * 1000),
    });

    expect(payload.urgenciaEstilo).toBe('countdown');
  });
});
