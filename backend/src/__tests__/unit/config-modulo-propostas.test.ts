const mockSelectLimit = jest.fn();
const mockSelectWhere = jest.fn(() => ({ limit: mockSelectLimit }));
const mockSelectFrom = jest.fn(() => ({ where: mockSelectWhere }));
const mockSelect = jest.fn(() => ({ from: mockSelectFrom }));

const mockUpdateWhere = jest.fn().mockResolvedValue(undefined);
const mockUpdateSet = jest.fn(() => ({ where: mockUpdateWhere }));
const mockUpdate = jest.fn(() => ({ set: mockUpdateSet }));

const mockInsertValues = jest.fn().mockResolvedValue(undefined);
const mockInsert = jest.fn(() => ({ values: mockInsertValues }));

jest.mock('../../../../server/lib/db', () => ({
  db: {
    select: (...args: unknown[]) => mockSelect(...args),
    update: (...args: unknown[]) => mockUpdate(...args),
    insert: (...args: unknown[]) => mockInsert(...args),
  },
}));

jest.mock('../../../../backend/src/db/schema/configuracoes-sistema', () => ({
  configuracoesSistema: { chave: 'chave', valores: 'valores', updatedAt: 'updated_at' },
}));

jest.mock('drizzle-orm', () => ({
  eq: (...args: unknown[]) => args,
}));

import { ConfigService } from '../../../../server/modules/configuracoes/config.service';
import { CONFIG_PROPOSTA_PADRAO } from '../../../../server/modules/fornecedores-hub/schema';
import { calcularValidoAte } from '../../../../server/modules/cotacao-publica/services/calcular-valido-ate';
import { buildValidadePayload } from '../../../../server/modules/propostas/proposta-validade';

describe('ConfigService — modulo_propostas (configuracoes_sistema)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('obterRegrasCotacao retorna padrão quando chave ausente', async () => {
    mockSelectLimit.mockResolvedValueOnce([]);

    const config = await ConfigService.obterRegrasCotacao();

    expect(config).toEqual(CONFIG_PROPOSTA_PADRAO);
  });

  it('obterRegrasCotacao lê JSONB persistido', async () => {
    mockSelectLimit.mockResolvedValueOnce([
      {
        valores: {
          ...CONFIG_PROPOSTA_PADRAO,
          validadeCotacaoHoras: 24,
          urgenciaEstilo: 'badge',
          avisoExpiracaoHoras: 0,
        },
      },
    ]);

    const config = await ConfigService.obterRegrasCotacao();

    expect(config.validadeCotacaoHoras).toBe(24);
    expect(config.urgenciaEstilo).toBe('badge');
    expect(config.avisoExpiracaoHoras).toBe(0);
  });

  it('salvarRegrasCotacao faz merge parcial e atualiza registro existente', async () => {
    mockSelectLimit
      .mockResolvedValueOnce([{ valores: CONFIG_PROPOSTA_PADRAO }])
      .mockResolvedValueOnce([{ chave: 'modulo_propostas' }]);

    const saved = await ConfigService.salvarRegrasCotacao({
      validadeCotacaoHoras: 72,
      urgenciaEstilo: 'nenhum',
    });

    expect(saved.validadeCotacaoHoras).toBe(72);
    expect(saved.urgenciaEstilo).toBe('nenhum');
    expect(saved.permitirApenasHotel).toBe(CONFIG_PROPOSTA_PADRAO.permitirApenasHotel);
    expect(mockUpdate).toHaveBeenCalled();
    expect(mockUpdateSet).toHaveBeenCalledWith(
      expect.objectContaining({
        valores: expect.objectContaining({
          validadeCotacaoHoras: 72,
          urgenciaEstilo: 'nenhum',
        }),
      }),
    );
  });

  it('salvarRegrasCotacao insere quando chave não existe', async () => {
    mockSelectLimit.mockResolvedValueOnce([]).mockResolvedValueOnce([]);

    const saved = await ConfigService.salvarRegrasCotacao({ avisoExpiracaoHoras: 4 });

    expect(saved.avisoExpiracaoHoras).toBe(4);
    expect(mockInsert).toHaveBeenCalled();
    expect(mockInsertValues).toHaveBeenCalledWith(
      expect.objectContaining({
        chave: 'modulo_propostas',
        valores: expect.objectContaining({ avisoExpiracaoHoras: 4 }),
      }),
    );
  });
});

describe('propagação modulo_propostas → validade e urgência', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calcularValidoAte usa validadeCotacaoHoras da config', async () => {
    mockSelectLimit.mockResolvedValue([
      {
        valores: {
          ...CONFIG_PROPOSTA_PADRAO,
          validadeCotacaoHoras: 24,
        },
      },
    ]);

    const antes = Date.now();
    const validoAte = await calcularValidoAte();
    const depois = Date.now();

    const minEsperado = antes + 24 * 60 * 60 * 1000;
    const maxEsperado = depois + 24 * 60 * 60 * 1000;
    expect(validoAte.getTime()).toBeGreaterThanOrEqual(minEsperado - 50);
    expect(validoAte.getTime()).toBeLessThanOrEqual(maxEsperado + 50);
  });

  it('buildValidadePayload expõe urgenciaEstilo salvo no admin', async () => {
    mockSelectLimit.mockResolvedValue([
      {
        valores: {
          ...CONFIG_PROPOSTA_PADRAO,
          urgenciaEstilo: 'badge',
        },
      },
    ]);

    const payload = await buildValidadePayload({
      status: 'sent',
      validoAte: new Date(Date.now() + 60 * 60 * 1000),
    });

    expect(payload.urgenciaEstilo).toBe('badge');
  });
});
