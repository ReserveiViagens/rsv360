const mockSelect = jest.fn();
const mockInsert = jest.fn();
const mockUpdate = jest.fn();

jest.mock('../../../../server/lib/db', () => ({
  db: {
    select: (...args: unknown[]) => mockSelect(...args),
    insert: (...args: unknown[]) => mockInsert(...args),
    update: (...args: unknown[]) => mockUpdate(...args),
  },
}));

jest.mock('../../../../backend/src/db/schema/acomodacoes', () => ({
  acomodacoes: {
    id: 'id',
    codigoExterno: 'codigo_externo',
    hotelId: 'hotel_id',
    titulo: 'titulo',
  },
}));

jest.mock('drizzle-orm', () => ({
  and: jest.fn((...args: unknown[]) => args),
  eq: jest.fn((a: unknown, b: unknown) => ({ a, b })),
}));

import { processarImport } from '../../../../server/modules/acomodacoes/import/importar';
import type { AcomodacaoImportResolved } from '../../../../server/modules/acomodacoes/import/acomodacao-import.types';

const dtoBase: AcomodacaoImportResolved = {
  codigoExterno: 'X1',
  empreendimento: 'hotel-demo-1',
  hotelId: 'hotel-demo-1',
  empreendimentoResolvido: true,
  tipo: 'apto',
  tipoId: 1,
  titulo: 'Apto Teste',
  quartos: 2,
  capacidadeMax: 4,
  configSala: 'nenhum',
  configBanheiro: 'so_wc_social',
  precoDiaria: 200,
  utensilios: [],
  eletrodomesticos: [],
  amenidades: [],
  midia: [],
};

function chainSelect(rows: unknown[]) {
  return {
    from: jest.fn().mockReturnValue({
      where: jest.fn().mockReturnValue({
        limit: jest.fn().mockResolvedValue(rows),
      }),
    }),
  };
}

describe('importar-upsert', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockInsert.mockReturnValue({
      values: jest.fn().mockReturnValue({
        returning: jest.fn().mockResolvedValue([{ id: 10 }]),
      }),
    });
    mockUpdate.mockReturnValue({
      set: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([{ id: 5 }]),
        }),
      }),
    });
  });

  it('primeira importação insere com dados_completos=false', async () => {
    mockSelect.mockReturnValue(chainSelect([]));

    const relatorio = await processarImport([dtoBase], { dryRun: false });
    expect(relatorio.linhas[0].acao).toBe('insert');
    expect(mockInsert).toHaveBeenCalled();
    const values = mockInsert.mock.results[0].value.values.mock.calls[0][0];
    expect(values.dadosCompletos).toBe(false);
    expect(values.statusPublicacao).toBe('rascunho');
  });

  it('re-import atualiza sem duplicar por codigo_externo', async () => {
    mockSelect.mockReturnValue(
      chainSelect([{ id: 5, codigoExterno: 'X1', hotelId: 'hotel-demo-1', titulo: 'Apto Teste' }]),
    );

    const relatorio = await processarImport([{ ...dtoBase, precoDiaria: 250 }], { dryRun: false });

    expect(relatorio.linhas[0].acao).toBe('update');
    expect(relatorio.linhas[0].acomodacaoId).toBe(5);
    expect(mockUpdate).toHaveBeenCalled();
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it('re-import por hotel_id+titulo quando sem codigo_externo', async () => {
    const semCodigo = { ...dtoBase, codigoExterno: null };
    mockSelect.mockReturnValue(
      chainSelect([{ id: 7, codigoExterno: null, hotelId: 'hotel-demo-1', titulo: 'Apto Teste' }]),
    );
    mockUpdate.mockReturnValue({
      set: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([{ id: 7 }]),
        }),
      }),
    });

    const relatorio = await processarImport([semCodigo], { dryRun: false });
    expect(relatorio.linhas[0].acao).toBe('update');
    expect(relatorio.linhas[0].acomodacaoId).toBe(7);
  });
});
