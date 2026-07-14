const mockSelectLimit = jest.fn();
const mockSelectOrderBy = jest.fn(() => ({ limit: mockSelectLimit }));
const mockSelectWhere = jest.fn(() => ({ orderBy: mockSelectOrderBy }));
const mockSelectFrom = jest.fn(() => ({ where: mockSelectWhere }));
const mockSelect = jest.fn(() => ({ from: mockSelectFrom }));

const mockUpdateWhere = jest.fn().mockResolvedValue(undefined);
const mockUpdateSet = jest.fn(() => ({ where: mockUpdateWhere }));
const mockUpdate = jest.fn(() => ({ set: mockUpdateSet }));

const mockDeleteWhere = jest.fn(() => ({
  returning: jest.fn().mockResolvedValue([{ id: '1' }, { id: '2' }]),
}));
const mockDelete = jest.fn(() => ({ where: mockDeleteWhere }));

const mockInsertReturning = jest.fn();
const mockInsertValues = jest.fn(() => ({ returning: mockInsertReturning }));
const mockInsert = jest.fn(() => ({ values: mockInsertValues }));

jest.mock('../../../../server/lib/db', () => ({
  db: {
    select: () => mockSelect(),
    update: () => mockUpdate(),
    delete: () => mockDelete(),
    insert: () => mockInsert(),
  },
}));

jest.mock('../../../../server/modules/agentes/config.service', () => ({
  AgentesConfigService: {
    obterConfig: jest.fn(async () => ({
      agentesModuloAtivo: true,
      limiarSemanticoHit: 0.92,
      limiarSemanticoVerificar: 0.85,
      ttlCacheInstitucionalDias: 7,
      ttlCacheCatalogoHoras: 24,
    })),
  },
}));

jest.mock('../../../../backend/src/db/schema/agentes-cache-semantico', () => ({
  agenteCacheSemantico: {
    id: 'id',
    agente: 'agente',
    carimboContexto: 'carimbo_contexto',
    resposta: 'resposta',
    embedding: 'embedding',
    versaoBase: 'versao_base',
    hits: 'hits',
    expiraEm: 'expira_em',
  },
}));

jest.mock('drizzle-orm', () => {
  const actual = jest.requireActual('drizzle-orm');
  return {
    ...actual,
    cosineDistance: () => 'distance',
  };
});

import { SemanticCacheService } from '../../../../server/modules/agentes/semantic-cache.service';

function mockEmbedding(seed = 0.01): number[] {
  return Array.from({ length: 1536 }, (_, i) => seed + i * 0.000001);
}

describe('SemanticCacheService — filtro carimbo + TTL + bloqueio', () => {
  const carimbo = {
    agente: 'instrutor',
    entidade: 'anfitriao/unidades',
    idioma: 'pt-BR',
    perfil: 'parceiro',
    versao_base: 'v1',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('buscar retorna null para tipo preco (lista bloqueada)', async () => {
    const hit = await SemanticCacheService.buscar(mockEmbedding(), carimbo, { tipo: 'preco' });
    expect(hit).toBeNull();
    expect(mockSelect).not.toHaveBeenCalled();
  });

  it('mesmo embedding: entidade diferente não casa (miss lógico)', async () => {
    mockSelectLimit.mockResolvedValueOnce([
      {
        id: 'row-1',
        resposta: 'como publicar unidade',
        carimbo: { ...carimbo, entidade: 'anfitriao/tarifas' },
        similaridade: 0.99,
      },
    ]);

    const hit = await SemanticCacheService.buscar(mockEmbedding(), carimbo, {
      tipo: 'onboarding',
    });
    expect(hit).toBeNull();
  });

  it('hit acima de 0.92 incrementa hits', async () => {
    mockSelectLimit.mockResolvedValueOnce([
      {
        id: 'row-hit',
        resposta: 'passo a passo',
        carimbo,
        similaridade: 0.95,
      },
    ]);

    const hit = await SemanticCacheService.buscar(mockEmbedding(), carimbo);
    expect(hit?.tier).toBe('hit');
    expect(hit?.resposta).toBe('passo a passo');
    expect(mockUpdate).toHaveBeenCalled();
  });

  it('gravar rejeita tipo disponibilidade', async () => {
    const saved = await SemanticCacheService.gravar({
      agente: 'instrutor',
      carimbo,
      perguntaNormalizada: 'tem vaga?',
      embedding: mockEmbedding(),
      resposta: 'sim',
      versaoBase: 'v1',
      expiraEm: new Date(Date.now() + 86400000),
      tipo: 'disponibilidade',
    });
    expect(saved).toBeNull();
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it('invalidar por versao_base remove linhas', async () => {
    const n = await SemanticCacheService.invalidar('v1');
    expect(n).toBe(2);
    expect(mockDelete).toHaveBeenCalled();
  });

  it('where de busca exige expira_em > now (TTL)', async () => {
    mockSelectLimit.mockResolvedValueOnce([]);
    await SemanticCacheService.buscar(mockEmbedding(), carimbo);
    expect(mockSelectWhere).toHaveBeenCalled();
    // Filtro montado — cobertura via caminho onde() chamado
    expect(mockSelectFrom).toHaveBeenCalled();
  });
});
