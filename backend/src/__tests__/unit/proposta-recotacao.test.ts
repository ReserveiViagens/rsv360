const mockWhere = jest.fn();
const mockFrom = jest.fn(() => ({ where: mockWhere }));
const mockSelect = jest.fn(() => ({ from: mockFrom }));
const mockReturning = jest.fn();
const mockInsertValues = jest.fn(() => ({ returning: mockReturning }));
const mockInsert = jest.fn(() => ({ values: mockInsertValues }));

jest.mock('../../../../server/lib/db', () => ({
  db: {
    select: (...args: unknown[]) => {
      mockSelect(...args);
      return { from: mockFrom };
    },
    insert: (...args: unknown[]) => {
      mockInsert(...args);
      return { values: mockInsertValues };
    },
  },
}));

jest.mock('../../../../backend/src/db/schema/propostas', () => ({
  propostas: { tokenPublico: 'token_publico' },
}));

jest.mock('drizzle-orm', () => ({
  eq: (...args: unknown[]) => args,
}));

jest.mock('../../../../server/lib/proposta-token', () => ({
  gerarTokenPublicoProposta: jest.fn(() => 'rt-novo-token-test'),
}));

const mockAplicarValidade = jest.fn().mockResolvedValue(new Date('2026-07-05T12:00:00.000Z'));
jest.mock('../../../../server/modules/propostas/aplicar-validade-proposta', () => ({
  aplicarValidadeProposta: (...args: unknown[]) => mockAplicarValidade(...args),
}));

const mockLogEvent = jest.fn();
jest.mock('../../../../server/modules/propostas/services/propostas.service', () => ({
  propostasService: { logEvent: (...args: unknown[]) => mockLogEvent(...args) },
}));

jest.mock('../../../../server/modules/propostas/metrics', () => ({
  recordPropostaGerada: jest.fn(),
}));

import {
  recotarPropostaPorToken,
  PropostaRecotacaoError,
} from '../../../../server/modules/propostas/services/proposta-recotacao.service';

const propostaExpirada = {
  id: 10,
  isPublica: true,
  status: 'expired',
  validoAte: new Date('2026-06-01T00:00:00.000Z'),
  titulo: 'Cotação Teste',
  clienteNome: 'João',
  valorTotal: '1000',
  moeda: 'BRL',
  versao: 1,
  metadata: { checkIn: '2026-07-10' },
  conteudo: { origem: 'wizard' },
};

describe('proposta-recotacao.service (PR 20)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockReturning.mockResolvedValue([{ id: 99, tokenPublico: 'rt-novo-token-test' }]);
  });

  it('clona proposta expirada e devolve novoToken', async () => {
    mockWhere.mockResolvedValueOnce([propostaExpirada]);

    const result = await recotarPropostaPorToken('rt-antigo');

    expect(result).toEqual({ novoToken: 'rt-novo-token-test' });
    expect(mockInsert).toHaveBeenCalled();
    expect(mockAplicarValidade).toHaveBeenCalledWith(99);
    expect(mockLogEvent).toHaveBeenCalledWith(
      10,
      'recotacao_origem',
      expect.any(String),
      expect.objectContaining({ novoToken: 'rt-novo-token-test' }),
    );
  });

  it('rejeita proposta não expirada com 403', async () => {
    mockWhere.mockResolvedValueOnce([
      {
        ...propostaExpirada,
        status: 'sent',
        validoAte: new Date('2099-01-01T00:00:00.000Z'),
      },
    ]);

    await expect(recotarPropostaPorToken('rt-ativa')).rejects.toMatchObject({
      statusCode: 403,
    });
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it('rejeita proposta paga com 403', async () => {
    mockWhere.mockResolvedValueOnce([
      {
        ...propostaExpirada,
        status: 'paid',
      },
    ]);

    await expect(recotarPropostaPorToken('rt-paga')).rejects.toBeInstanceOf(PropostaRecotacaoError);
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it('rejeita proposta aceita mesmo com valido_ate vencido (validade comercial encerrada no aceite)', async () => {
    mockWhere.mockResolvedValueOnce([
      {
        ...propostaExpirada,
        status: 'accepted',
      },
    ]);

    await expect(recotarPropostaPorToken('rt-aceita-expirada')).rejects.toMatchObject({
      statusCode: 403,
    });
    expect(mockInsert).not.toHaveBeenCalled();
  });
});
