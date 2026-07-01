jest.mock('../../../../server/modules/acomodacoes/import/normalizar', () => {
  const actual = jest.requireActual('../../../../server/modules/acomodacoes/import/normalizar');
  return {
    ...actual,
    resolverHotelComMeta: jest.fn(async (nome: string) => ({
      hotelId: nome ? `hotel-${nome}` : null,
      resolvido: nome !== 'Empreendimento Desconhecido',
    })),
    resolverOuCriarTipo: jest.fn(async () => 1),
  };
});

import { normalizarLote, splitLista } from '../../../../server/modules/acomodacoes/import/normalizar';
import { processarImport } from '../../../../server/modules/acomodacoes/import/importar';
import type { AcomodacaoImportResolved } from '../../../../server/modules/acomodacoes/import/acomodacao-import.types';

const mockSelect = jest.fn();

jest.mock('../../../../server/lib/db', () => ({
  db: {
    select: (...args: unknown[]) => mockSelect(...args),
    insert: jest.fn().mockReturnValue({
      values: jest.fn().mockReturnValue({
        returning: jest.fn().mockResolvedValue([{ id: 1 }]),
      }),
    }),
    update: jest.fn(),
    execute: jest.fn(),
  },
}));

jest.mock('../../../../backend/src/db/schema/acomodacoes', () => ({
  acomodacoes: { id: 'id', codigoExterno: 'codigo_externo', hotelId: 'hotel_id', titulo: 'titulo' },
}));

jest.mock('drizzle-orm', () => ({
  and: jest.fn((...args: unknown[]) => args),
  eq: jest.fn((a: unknown, b: unknown) => ({ a, b })),
  sql: jest.fn(),
}));

function chainSelect(rows: unknown[]) {
  return {
    from: jest.fn().mockReturnValue({
      where: jest.fn().mockReturnValue({
        limit: jest.fn().mockResolvedValue(rows),
      }),
    }),
  };
}

const dtoIntegra: AcomodacaoImportResolved = {
  codigoExterno: 'OK1',
  empreendimento: 'Piazza',
  hotelId: 'piazza-diroma',
  empreendimentoResolvido: true,
  tipo: 'apto',
  tipoId: 1,
  titulo: 'Apto OK',
  quartos: 2,
  capacidadeMax: 4,
  configSala: 'nenhum',
  configBanheiro: 'so_wc_social',
  precoDiaria: 250,
  utensilios: [],
  eletrodomesticos: [],
  amenidades: [],
  midia: [],
};

describe('políticas de import inventário 436', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSelect.mockReturnValue(chainSelect([]));
  });

  it('tipo=predio é ignorado (skip)', async () => {
    const { validos, ignorados } = await normalizarLote([
      {
        empreendimento: 'Demo',
        tipo: 'predio',
        titulo: 'Bloco',
        capacidade_max: 10,
        quartos: 0,
      },
      {
        empreendimento: 'Demo',
        tipo: 'apto',
        titulo: 'OK',
        capacidade_max: 4,
        quartos: 2,
      },
    ]);

    expect(validos).toHaveLength(1);
    expect(ignorados).toHaveLength(1);
    expect(ignorados[0].erros[0]).toMatch(/predio/i);
  });

  it('quartos=0 passa na validação Zod', async () => {
    const { validos, erros } = await normalizarLote([
      {
        empreendimento: 'Studio',
        tipo: 'studio',
        titulo: 'Studio 0Q',
        capacidade_max: 2,
        quartos: 0,
      },
    ]);
    expect(erros).toHaveLength(0);
    expect(validos[0].quartos).toBe(0);
  });

  it('splitLista não divide ; dentro de parênteses', () => {
    expect(splitLista('piscina;churrasqueira (com gás; lenha)')).toEqual([
      'piscina',
      'churrasqueira (com gás; lenha)',
    ]);
  });

  it('preco_diaria vazio no CSV não vira 0 (rascunho no bulk)', async () => {
    const { validos } = await normalizarLote([
      {
        empreendimento: 'Demo',
        tipo: 'apto',
        titulo: 'Sem preço',
        capacidade_max: 2,
        quartos: 1,
        preco_diaria: '',
      },
    ]);
    expect(validos[0].precoDiaria).toBeNull();
  });

  it('bulkPublicado sem preço → rascunho', async () => {
    const relatorio = await processarImport(
      [{ ...dtoIntegra, precoDiaria: null }],
      { dryRun: false, bulkPublicado: true },
    );
    expect(relatorio.sucesso).toBe(1);
    const values = (jest.requireMock('../../../../server/lib/db').db.insert as jest.Mock).mock
      .results[0].value.values.mock.calls[0][0];
    expect(values.statusPublicacao).toBe('rascunho');
  });

  it('bulkPublicado com empreendimento não resolvido → rascunho', async () => {
    const relatorio = await processarImport(
      [{ ...dtoIntegra, empreendimentoResolvido: false, avisos: ['empreendimento não resolvido'] }],
      { dryRun: false, bulkPublicado: true },
    );
    expect(relatorio.sucesso).toBe(1);
    const values = (jest.requireMock('../../../../server/lib/db').db.insert as jest.Mock).mock
      .results[0].value.values.mock.calls[0][0];
    expect(values.statusPublicacao).toBe('rascunho');
  });

  it('bulkPublicado íntegro → publicado', async () => {
    await processarImport([dtoIntegra], { dryRun: false, bulkPublicado: true });
    const values = (jest.requireMock('../../../../server/lib/db').db.insert as jest.Mock).mock
      .results[0].value.values.mock.calls[0][0];
    expect(values.statusPublicacao).toBe('publicado');
  });
});
