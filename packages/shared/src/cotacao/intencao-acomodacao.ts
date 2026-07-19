import {
  buscarPorRelevancia,
  type AcomodacaoCriterios,
  type AcomodacaoDisponivel,
  type AcomodacaoRanqueada,
  type ConfigBanheiro,
  type ConfigSala,
} from './buscar-por-relevancia.js';
import {
  getEtapaAUnidade,
  getPinnedCodigosExternos,
  isEtapaAHotel,
  papelLabelFromUnidade,
} from './etapa-a-mapeamento.js';

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

function sortCards(cards: CardArquetipoPasso2[]): CardArquetipoPasso2[] {
  return cards.sort((a, b) => {
    const pa = a.acomodacao.premiumAncora ? 1 : 0;
    const pb = b.acomodacao.premiumAncora ? 1 : 0;
    if (pb !== pa) return pb - pa;
    return a.acomodacao.precoDiaria - b.acomodacao.precoDiaria;
  });
}

function toRanqueada(item: AcomodacaoDisponivel, hospedes: number): AcomodacaoRanqueada {
  const ranked = buscarPorRelevancia({ hospedes }, [item]);
  return ranked[0] ?? { ...item, matchPct: 0, atende: [], difere: [], temExato: false };
}

function enrichArquetipoFromEtapaA(
  arquetipo: ArquetipoAcomodacao,
  acomodacao: AcomodacaoDisponivel,
): ArquetipoAcomodacao {
  if (!acomodacao.codigoExterno) return arquetipo;
  const unit = getEtapaAUnidade(acomodacao.codigoExterno);
  if (!unit) return arquetipo;
  return {
    ...arquetipo,
    id: unit.codigoExterno.toLowerCase(),
    label: papelLabelFromUnidade(unit),
    quartosDesejados: unit.quartos,
  };
}

function arquetipoFromPin(codigoExterno: string): ArquetipoAcomodacao {
  const unit = getEtapaAUnidade(codigoExterno);
  if (!unit) {
    return {
      id: codigoExterno.toLowerCase(),
      label: codigoExterno,
      eixo: 'preco',
      quartosDesejados: 1,
    };
  }
  return {
    id: unit.codigoExterno.toLowerCase(),
    label: papelLabelFromUnidade(unit),
    eixo: unit.premiumAncora ? 'experiencia' : 'preco',
    quartosDesejados: unit.quartos,
  };
}

function findByCodigo(
  disponiveis: AcomodacaoDisponivel[],
  codigoExterno: string,
): AcomodacaoDisponivel | undefined {
  return disponiveis.find((d) => d.codigoExterno === codigoExterno);
}

/** Montagem por relevância (legado + fallback Etapa A). */
export function montarCardsPorRelevancia(
  perfil: WizardProfile,
  adultos: number,
  criancas: number,
  disponiveis: AcomodacaoDisponivel[],
): CardArquetipoPasso2[] {
  if (disponiveis.length === 0) return [];

  const hospedes = adultos + criancas;
  const arquetipos = arquetiposPara(perfil, adultos, criancas);
  const seen = new Set<number>();
  const cards: CardArquetipoPasso2[] = [];

  for (const arquetipo of arquetipos) {
    const ranked = buscarPorRelevancia(criteriosFromArquetipo(arquetipo, hospedes), disponiveis);
    const pick = ranked.find((r) => !seen.has(r.id)) ?? ranked[0];
    if (!pick || seen.has(pick.id)) continue;
    seen.add(pick.id);
    cards.push({
      arquetipo: enrichArquetipoFromEtapaA(arquetipo, pick),
      acomodacao: pick,
      badge: pick.temExato ? 'Recomendado' : 'Mais próximo disponível',
    });
  }

  return sortCards(cards);
}

/**
 * Pins determinísticos nos 4 âncora Etapa A.
 * Se pin ausente em `disponiveis` → fallback relevância (nunca vazio/throw).
 */
export function resolverCardsEtapaA(
  hotelId: string,
  perfil: WizardProfile,
  adultos: number,
  criancas: number,
  disponiveis: AcomodacaoDisponivel[],
): CardArquetipoPasso2[] {
  if (disponiveis.length === 0) return [];

  const pins = getPinnedCodigosExternos(hotelId, perfil, adultos, criancas);
  if (pins === undefined) {
    return montarCardsPorRelevancia(perfil, adultos, criancas, disponiveis);
  }

  const hospedes = adultos + criancas;
  const cards: CardArquetipoPasso2[] = [];

  for (const codigo of pins) {
    const item = findByCodigo(disponiveis, codigo);
    if (!item) continue;
    const ranked = toRanqueada(item, hospedes);
    cards.push({
      arquetipo: arquetipoFromPin(codigo),
      acomodacao: ranked,
      badge: ranked.temExato ? 'Recomendado' : 'Mais próximo disponível',
    });
  }

  if (cards.length === 0) {
    return montarCardsPorRelevancia(perfil, adultos, criancas, disponiveis);
  }

  return sortCards(cards);
}

export function montarCardsPasso2(
  perfil: WizardProfile,
  adultos: number,
  criancas: number,
  disponiveis: AcomodacaoDisponivel[],
  hotelId?: string,
): CardArquetipoPasso2[] {
  if (disponiveis.length === 0) return [];

  const resolvedHotelId = hotelId ?? disponiveis[0]?.hotelId;
  if (resolvedHotelId && isEtapaAHotel(resolvedHotelId)) {
    return resolverCardsEtapaA(resolvedHotelId, perfil, adultos, criancas, disponiveis);
  }

  return montarCardsPorRelevancia(perfil, adultos, criancas, disponiveis);
}
