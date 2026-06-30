import {
  normalizarChaveCabecalho,
  normalizarEnumBanheiro,
  normalizarEnumSala,
  normalizarLinhaBruta,
  splitLista,
} from '../../../../server/modules/acomodacoes/import/normalizar';

describe('normalizar-import', () => {
  it('mapeia cabeçalhos PT para campos canônicos', () => {
    expect(normalizarChaveCabecalho('Código Externo')).toBe('codigo_externo');
    expect(normalizarChaveCabecalho('Capacidade Máx')).toBe('capacidade_max');
    expect(normalizarChaveCabecalho('Preço Diária')).toBe('preco_diaria');
  });

  it('normaliza linha com cabeçalhos PT e listas por ;', () => {
    const out = normalizarLinhaBruta({
      Empreendimento: 'Hotel Rio',
      Título: 'Apto 2Q',
      'Capacidade Máx': 6,
      Quartos: 2,
      Tipo: 'apto',
      Utensílios: 'panela;frigideira',
      'Config Sala': 'sofá-cama',
      'Config Banheiro': 'só suíte',
    });

    expect(out.empreendimento).toBe('Hotel Rio');
    expect(out.titulo).toBe('Apto 2Q');
    expect(out.capacidadeMax).toBe(6);
    expect(out.utensilios).toEqual(['panela', 'frigideira']);
    expect(out.configSala).toBe('sofa_cama');
    expect(out.configBanheiro).toBe('so_suite');
  });

  it('normaliza enums de sala e banheiro', () => {
    expect(normalizarEnumSala('nenhum')).toBe('nenhum');
    expect(normalizarEnumSala('Sofá Cama')).toBe('sofa_cama');
    expect(normalizarEnumBanheiro('wc social')).toBe('so_wc_social');
    expect(normalizarEnumBanheiro('suite + wc social')).toBe('suite_wc_social');
  });

  it('splitLista aceita string ou array', () => {
    expect(splitLista('a;b;c')).toEqual(['a', 'b', 'c']);
    expect(splitLista(['x', 'y'])).toEqual(['x', 'y']);
    expect(splitLista('')).toEqual([]);
  });
});
