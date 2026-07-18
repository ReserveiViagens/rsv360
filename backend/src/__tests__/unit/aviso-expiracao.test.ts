const mockWhere = jest.fn();
const mockFrom = jest.fn(() => ({ where: mockWhere }));
const mockSelect = jest.fn((..._args: unknown[]) => ({ from: mockFrom }));

jest.mock('../../../../server/lib/db', () => ({
  db: {
    select: (...args: unknown[]) => {
      mockSelect(...args);
      return { from: mockFrom };
    },
    update: jest.fn(() => ({ set: jest.fn(() => ({ where: jest.fn() })) })),
  },
}));

jest.mock('../../../../backend/src/db/schema/propostas', () => ({
  propostas: { id: 'id', status: 'status' },
}));

jest.mock('drizzle-orm', () => ({
  eq: (...args: unknown[]) => args,
}));

jest.mock('../../../../server/modules/configuracoes/config.service', () => ({
  ConfigService: { obterRegrasCotacao: jest.fn().mockResolvedValue({ avisoExpiracaoHoras: 2 }) },
}));

jest.mock('../../../../server/modules/propostas/services/propostas.service', () => ({
  propostasService: { logEvent: jest.fn() },
}));

import { enviarAvisoExpiracaoSeNecessario } from '../../../../server/modules/propostas/services/aviso-expiracao.service';

describe('aviso-expiracao — idempotência e status fechado', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('não envia aviso para proposta já aceita', async () => {
    mockWhere.mockResolvedValueOnce([
      {
        id: 26,
        status: 'accepted',
        isPublica: true,
        avisoExpiracaoEnviado: false,
        validoAte: new Date(Date.now() + 60 * 60 * 1000),
        conteudo: { inclusions: { destination: 'Caldas Novas' } },
        tokenPublico: 'rt-test',
        clienteTelefone: '64999999999',
      },
    ]);

    const result = await enviarAvisoExpiracaoSeNecessario(26);

    expect(result.skipped).toBe(true);
    expect(result.reason).toBe('status_fechado');
  });

  it('não reenvia se aviso_expiracao_enviado já é true', async () => {
    mockWhere.mockResolvedValueOnce([
      {
        id: 10,
        status: 'sent',
        isPublica: true,
        avisoExpiracaoEnviado: true,
        validoAte: new Date(Date.now() + 60 * 60 * 1000),
        conteudo: {},
        tokenPublico: 'rt-x',
      },
    ]);

    const result = await enviarAvisoExpiracaoSeNecessario(10);

    expect(result.skipped).toBe(true);
    expect(result.reason).toBe('already_sent');
  });
});
