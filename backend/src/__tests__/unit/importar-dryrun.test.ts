jest.mock('../../../../server/modules/acomodacoes/import/normalizar', () => {
  const actual = jest.requireActual('../../../../server/modules/acomodacoes/import/normalizar');
  return {
    ...actual,
    resolverHotel: jest.fn(async (nome: string) => (nome ? `hotel-${nome}` : null)),
    resolverOuCriarTipo: jest.fn(async () => 1),
  };
});

import { normalizarLote } from '../../../../server/modules/acomodacoes/import/normalizar';
import { processarImport } from '../../../../server/modules/acomodacoes/import/importar';

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

jest.mock('../../../../backend/src/db/schema/tipos-acomodacao', () => ({
  tiposAcomodacao: { id: 'id', slug: 'slug' },
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

describe('importar-dryrun', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSelect.mockReturnValue(chainSelect([]));
  });

  it('linha inválida reportada na normalização e lote segue', async () => {
    const { validos, erros } = await normalizarLote([
      {
        empreendimento: 'Demo',
        tipo: 'apto',
        titulo: 'OK',
        capacidade_max: 4,
        quartos: 2,
      },
      {
        empreendimento: 'Demo',
        tipo: 'apto',
        titulo: '',
        capacidade_max: 0,
      },
    ]);

    expect(validos).toHaveLength(1);
    expect(erros).toHaveLength(1);
    expect(erros[0].erros.length).toBeGreaterThan(0);

    const relatorio = await processarImport(validos, { dryRun: true });
    expect(relatorio.dryRun).toBe(true);
    expect(relatorio.sucesso).toBe(1);
    expect(relatorio.linhas[0].acao).toBe('preview');
  });
});
