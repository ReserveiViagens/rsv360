const mockRegistrar = jest.fn();
const mockGetExact = jest.fn();
const mockSetExact = jest.fn();
const mockSemanticBuscar = jest.fn();
const mockSemanticGravar = jest.fn();
const mockObterConfig = jest.fn();

jest.mock('../../../../server/modules/agentes/execucoes.service', () => ({
  AgentesExecucoesService: {
    registrar: (...a: unknown[]) => mockRegistrar(...a),
  },
}));

jest.mock('../../../../server/modules/agentes/exact-cache', () => ({
  hashEntrada: (s: string) => `h:${s.length}`,
  getExactCache: (...a: unknown[]) => mockGetExact(...a),
  setExactCache: (...a: unknown[]) => mockSetExact(...a),
}));

jest.mock('../../../../server/modules/agentes/semantic-cache.service', () => ({
  SemanticCacheService: {
    buscar: (...a: unknown[]) => mockSemanticBuscar(...a),
    gravar: (...a: unknown[]) => mockSemanticGravar(...a),
  },
}));

jest.mock('../../../../server/modules/agentes/config.service', () => ({
  AgentesConfigService: {
    obterConfig: () => mockObterConfig(),
  },
}));

jest.mock('../../../../server/modules/agentes/instrutor/openai.client', () => ({
  hasOpenAiKey: () => false,
  embedText: jest.fn(),
  chatInstrutor: jest.fn(),
}));

import { executarT1 } from '../../../../server/modules/agentes/instrutor/instrutor-t1';
import { AGENTES_CONFIG_PADRAO } from '../../../../server/modules/agentes/schema';

describe('Instrutor T1 — fail-safe sem OPENAI_API_KEY', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockObterConfig.mockResolvedValue({ ...AGENTES_CONFIG_PADRAO });
    mockGetExact.mockResolvedValue(null);
  });

  it('sem chave e miss exact → 503', async () => {
    const r = await executarT1('pergunta sem match cache', 'staff');
    expect(r.status).toBe(503);
    expect(r.resposta).toMatch(/indisponível/i);
    expect(r.cacheHit).toBe('none');
    expect(r.tier).toBe('t1');
  });

  it('exact hit não precisa de chave', async () => {
    mockGetExact.mockResolvedValue('Resposta cached\n\nOnde clicar: /orcamentos');
    const r = await executarT1('pergunta', 'staff');
    expect(r.status).toBe(200);
    expect(r.cacheHit).toBe('exact');
  });
});
