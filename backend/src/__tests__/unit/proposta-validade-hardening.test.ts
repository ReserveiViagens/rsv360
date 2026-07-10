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
  assertPropostaNaoExpirada,
  buildValidadePayload,
  isPropostaExpirada,
  marcarExpirada,
  PropostaExpiradaError,
  PROPOSTA_STATUS_FECHADO,
} from '../../../../server/modules/propostas/proposta-validade';
import {
  buildPropostaPublicaResponse,
  deveRedactarPropostaPublica,
} from '../../../../server/modules/propostas/proposta-publica-payload';

const PAST = new Date('2020-01-01T00:00:00.000Z');
const FUTURE = new Date(Date.now() + 48 * 60 * 60 * 1000);

const baseRow = {
  id: 10,
  titulo: 'Cotação Caldas Novas — Maria',
  clienteNome: 'Maria',
  valorTotal: '868.00',
  moeda: 'BRL',
  tokenPublico: 'rt-hardening-test',
  conteudo: {
    itens: [{ descricao: 'Hotel', precoTotal: '868.00' }],
    dailySchedule: [{ day: 1, title: 'Dia 1' }],
  },
  metadata: { checkIn: '2026-08-01', checkOut: '2026-08-03', adults: 2 },
  comparativoCache: [{ titulo: 'OTA', preco: 999 }],
  exibirComparativo: false,
};

describe('proposta validade hardening', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('1. accepted + valido_ate vencido → não expirada comercialmente (roteiro completo)', async () => {
    const row = { status: 'accepted', validoAte: PAST };
    expect(isPropostaExpirada(row)).toBe(false);
    const validade = await buildValidadePayload(row);
    expect(validade.expirada).toBe(false);

    const roteiroPayload = buildPropostaPublicaResponse({ ...baseRow, ...row });
    expect(roteiroPayload.valorTotal).toBe('868.00');
    expect(roteiroPayload.conteudo).toBeDefined();
    expect(deveRedactarPropostaPublica({ ...baseRow, ...row })).toBe(false);
  });

  it('2. paid + valido_ate vencido → não expirada', async () => {
    const row = { status: 'paid', validoAte: PAST };
    expect(isPropostaExpirada(row)).toBe(false);
    const validade = await buildValidadePayload(row);
    expect(validade.expirada).toBe(false);
  });

  it('3. sent + vencido → payload mínimo sem preço nem roteiro', () => {
    const row = { ...baseRow, status: 'sent', validoAte: PAST };
    expect(isPropostaExpirada(row)).toBe(true);
    const payload = buildPropostaPublicaResponse(row);
    expect(payload.payloadReduzido).toBe(true);
    expect(payload.status).toBe('expired');
    expect(payload.valorTotal).toBeUndefined();
    expect(payload.conteudo).toBeUndefined();
    expect(String(payload.recotacaoUrl)).toContain('/cotacao?');
    expect(String(payload.whatsappUrl)).toContain('wa.me');
  });

  it('4. sent + válido → payload completo (regressão)', () => {
    const row = { ...baseRow, status: 'sent', validoAte: FUTURE };
    expect(isPropostaExpirada(row)).toBe(false);
    const payload = buildPropostaPublicaResponse(row);
    expect(payload.payloadReduzido).toBe(false);
    expect(payload.valorTotal).toBe('868.00');
    expect((payload.conteudo as { dailySchedule?: unknown[] }).dailySchedule?.length).toBe(1);
  });

  it('5. aceitar proposta vencida → assertPropostaNaoExpirada bloqueia (403)', async () => {
    mockReturning.mockResolvedValue([
      { id: 99, status: 'expired', tokenPublico: 'rt-x' },
    ]);
    await expect(
      assertPropostaNaoExpirada({ id: 99, status: 'sent', validoAte: PAST }),
    ).rejects.toBeInstanceOf(PropostaExpiradaError);
  });

  it('6. worker não marca expired proposta accepted/paid (status fechados)', async () => {
    expect(PROPOSTA_STATUS_FECHADO).toEqual(
      expect.arrayContaining(['accepted', 'paid', 'converted']),
    );
    mockReturning.mockResolvedValue([]);
    const result = await marcarExpirada(42);
    expect(result).toBeNull();
    expect(mockUpdate).toHaveBeenCalled();
  });
});
