import {
  arquetiposPara,
  buscarPorRelevancia,
  kitEstouraCapacidade,
  montarCardsPasso2,
  revalidarKitSelecionado,
  resolveKitCapacidadeMax,
} from '@rsv360/shared';

describe('buscarPorRelevancia', () => {
  const base = [
    {
      id: 1,
      titulo: 'Apto 1qt',
      quartos: 1,
      configSala: 'sofa_cama' as const,
      configBanheiro: 'so_wc_social' as const,
      capacidadeMax: 4,
      precoDiaria: 200,
      disponivel: true,
    },
    {
      id: 2,
      titulo: 'Apto 2qt',
      quartos: 2,
      configSala: 'nenhum' as const,
      configBanheiro: 'so_suite' as const,
      capacidadeMax: 6,
      precoDiaria: 350,
      disponivel: true,
    },
  ];

  it('nunca retorna vazio quando há disponíveis', () => {
    const ranked = buscarPorRelevancia({ hospedes: 5, quartosDesejados: 2 }, base);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked[0].matchPct).toBeGreaterThanOrEqual(0);
  });

  it('prioriza maior capacidade para família', () => {
    const ranked = buscarPorRelevancia({ hospedes: 5 }, base);
    expect(ranked[0].id).toBe(2);
  });
});

describe('arquetiposPara', () => {
  it('retorna econômico + experiência para família', () => {
    const arq = arquetiposPara('familia', 2, 2);
    expect(arq).toHaveLength(2);
    expect(arq[0].id).toBe('economico');
    expect(arq[1].id).toBe('experiencia');
  });

  it('montarCardsPasso2 de-dup e ordena por preço', () => {
    const disponiveis = [
      {
        id: 10,
        titulo: 'Eco',
        quartos: 1,
        configSala: 'sofa_cama' as const,
        configBanheiro: 'so_wc_social' as const,
        capacidadeMax: 5,
        precoDiaria: 180,
      },
      {
        id: 11,
        titulo: 'Exp',
        quartos: 2,
        configSala: 'nenhum' as const,
        configBanheiro: 'so_wc_social' as const,
        capacidadeMax: 6,
        precoDiaria: 320,
      },
    ];
    const cards = montarCardsPasso2('familia', 2, 2, disponiveis);
    expect(cards.length).toBeGreaterThan(0);
    expect(cards[0].acomodacao.precoDiaria).toBeLessThanOrEqual(cards[cards.length - 1].acomodacao.precoDiaria);
  });
});

describe('kit capacidade — revalidação PR 18 item 0', () => {
  it('detecta estouro e sugere limpeza', () => {
    expect(kitEstouraCapacidade('kit-casal', 4)).toBe(true);
    const r = revalidarKitSelecionado('kit-casal', 4, resolveKitCapacidadeMax('kit-casal'));
    expect(r.limpar).toBe(true);
    expect(r.sugestaoKitId).toBe('kit-familia');
  });

  it('não limpa kit compatível', () => {
    const r = revalidarKitSelecionado('kit-familia', 4);
    expect(r.limpar).toBe(false);
  });
});
