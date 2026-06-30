import {
  buscarPorRelevancia,
  type AcomodacaoCriterios,
  type AcomodacaoDisponivel,
  type AcomodacaoRanqueada,
  type ConfigBanheiro,
  type ConfigSala,
} from './buscar-por-relevancia.js';

export type WizardProfile = 'familia' | 'casal' | 'aventura';

export interface ArquetipoAcomodacao {
  id: string;
  label: string;
  eixo: 'preco' | 'experiencia';
  quartosDesejados: number;
  configSala?: ConfigSala;
  configBanheiro?: ConfigBanheiro;
}

export interface CardArquetipoPasso2 {
  arquetipo: ArquetipoAcomodacao;
  acomodacao: AcomodacaoRanqueada;
  badge: 'Recomendado' | 'Mais próximo disponível';
}

export function arquetiposPara(
  perfil: WizardProfile,
  adultos: number,
  criancas: number,
): ArquetipoAcomodacao[] {
  const hospedes = adultos + criancas;

  if (perfil === 'familia' || criancas >= 1 || hospedes >= 3) {
    return [
      {
        id: 'economico',
        label: 'Econômico',
        eixo: 'preco',
        quartosDesejados: 1,
        configSala: 'sofa_cama',
        configBanheiro: 'so_wc_social',
      },
      {
        id: 'experiencia',
        label: 'Experiência',
        eixo: 'experiencia',
        quartosDesejados: 2,
        configSala: 'nenhum',
        configBanheiro: 'so_wc_social',
      },
    ];
  }

  if (adultos >= 4) {
    return [
      {
        id: 'custo-beneficio',
        label: 'Custo-benefício',
        eixo: 'preco',
        quartosDesejados: 2,
        configBanheiro: 'so_wc_social',
      },
      {
        id: 'privacidade',
        label: 'Privacidade',
        eixo: 'experiencia',
        quartosDesejados: 2,
        configBanheiro: 'so_suite',
      },
    ];
  }

  return [
    {
      id: 'casal',
      label: 'Casal',
      eixo: 'preco',
      quartosDesejados: 1,
      configBanheiro: 'so_wc_social',
    },
  ];
}

function criteriosFromArquetipo(
  arquetipo: ArquetipoAcomodacao,
  hospedes: number,
): AcomodacaoCriterios {
  return {
    hospedes,
    quartosDesejados: arquetipo.quartosDesejados,
    configSala: arquetipo.configSala,
    configBanheiro: arquetipo.configBanheiro,
  };
}

export function montarCardsPasso2(
  perfil: WizardProfile,
  adultos: number,
  criancas: number,
  disponiveis: AcomodacaoDisponivel[],
): CardArquetipoPasso2[] {
  if (disponiveis.length === 0) return [];

  const hospedes = adultos + criancas;
  const arquetipos = arquetiposPara(perfil, adultos, criancas);
  const seen = new Set<string | number>();
  const cards: CardArquetipoPasso2[] = [];

  for (const arquetipo of arquetipos) {
    const ranked = buscarPorRelevancia(criteriosFromArquetipo(arquetipo, hospedes), disponiveis);
    const pick = ranked.find((r) => !seen.has(r.id)) ?? ranked[0];
    if (!pick || seen.has(pick.id)) continue;
    seen.add(pick.id);
    cards.push({
      arquetipo,
      acomodacao: pick,
      badge: pick.temExato ? 'Recomendado' : 'Mais próximo disponível',
    });
  }

  return cards.sort((a, b) => a.acomodacao.precoDiaria - b.acomodacao.precoDiaria);
}
