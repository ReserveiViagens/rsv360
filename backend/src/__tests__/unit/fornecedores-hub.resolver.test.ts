import type { OfertaNormalizada } from '../../../../server/modules/fornecedores-hub/types';

const mockLerRedis = jest.fn();
const mockGravarRedis = jest.fn();
const mockApagarRedis = jest.fn();
const mockBuscarHub = jest.fn();
const mockPgLer = jest.fn();
const mockPgGravar = jest.fn();
const mockPgApagar = jest.fn();

jest.mock('../../../../server/modules/fornecedores-hub/cache', () => ({
  ...jest.requireActual('../../../../server/modules/fornecedores-hub/cache'),
  lerRedis: (...args: unknown[]) => mockLerRedis(...args),
  gravarRedis: (...args: unknown[]) => mockGravarRedis(...args),
  apagarRedis: (...args: unknown[]) => mockApagarRedis(...args),
}));

jest.mock('../../../../server/modules/fornecedores-hub/hub', () => ({
  buscarPrecosConcorrencia: (...args: unknown[]) => mockBuscarHub(...args),
}));

jest.mock('../../../../server/modules/fornecedores-hub/services/ofertas-cache.service', () => ({
  ofertasCacheService: {
    ler: (...args: unknown[]) => mockPgLer(...args),
    gravar: (...args: unknown[]) => mockPgGravar(...args),
    apagar: (...args: unknown[]) => mockPgApagar(...args),
  },
}));

import { invalidarCache, resolverOfertas } from '../../../../server/modules/fornecedores-hub/resolver';

const oferta: OfertaNormalizada = {
  fornecedor: 'trend',
  tipo: 'hospedagem',
  titulo: 'Hotel',
  preco: 100,
  moeda: 'BRL',
  imagens: [],
  descricao: '',
  fonte: 'https://example.com',
  capturadoEm: new Date().toISOString(),
};

describe('fornecedores-hub — resolverOfertas', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('retorna origem redis quando há hit quente', async () => {
    mockLerRedis.mockResolvedValueOnce([oferta]);
    const result = await resolverOfertas('hospedagem', 'Caldas Novas');
    expect(result.origem).toBe('redis');
    expect(result.ofertas).toHaveLength(1);
    expect(mockBuscarHub).not.toHaveBeenCalled();
  });

  it('reaquece redis a partir do postgres válido', async () => {
    mockLerRedis.mockResolvedValueOnce(null);
    mockPgLer.mockResolvedValueOnce({
      chave: 'hospedagem:caldas-novas',
      ofertas: [oferta],
      origem: 'hub',
      capturadoEm: new Date(),
    });
    const result = await resolverOfertas('hospedagem', 'Caldas Novas');
    expect(result.origem).toBe('postgres');
    expect(mockGravarRedis).toHaveBeenCalled();
    expect(mockBuscarHub).not.toHaveBeenCalled();
  });

  it('consulta hub e persiste nas duas camadas em miss', async () => {
    mockLerRedis.mockResolvedValueOnce(null);
    mockPgLer.mockResolvedValueOnce(null);
    mockBuscarHub.mockResolvedValueOnce([oferta]);
    const result = await resolverOfertas('hospedagem', 'Caldas Novas');
    expect(result.origem).toBe('hub');
    expect(mockPgGravar).toHaveBeenCalled();
    expect(mockGravarRedis).toHaveBeenCalled();
  });

  it('invalidarCache limpa redis e postgres', async () => {
    const chave = await invalidarCache('hospedagem', 'Caldas Novas');
    expect(chave).toBe('hospedagem:caldas-novas');
    expect(mockApagarRedis).toHaveBeenCalledWith('hospedagem:caldas-novas');
    expect(mockPgApagar).toHaveBeenCalledWith('hospedagem:caldas-novas');
  });
});
