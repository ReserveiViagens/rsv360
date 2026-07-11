export type ConfigSala = 'nenhum' | 'cama_na_sala' | 'sofa_cama';
export type ConfigBanheiro = 'suite_wc_social' | 'so_suite' | 'so_wc_social';

export interface AcomodacaoCriterios {
  hospedes: number;
  quartosDesejados?: number;
  configSala?: ConfigSala;
  configBanheiro?: ConfigBanheiro;
}

export interface AcomodacaoDisponivel {
  id: number | string;
  /** Código externo Etapa A (ex.: ATR-SUV, KN39H). */
  codigoExterno?: string;
  titulo: string;
  quartos: number;
  configSala: ConfigSala;
  configBanheiro: ConfigBanheiro;
  capacidadeMax: number;
  precoDiaria: number;
  hotelId?: string;
  /** Eliminatória de disponibilidade (datas/propriedade). */
  disponivel?: boolean;
  /** Upgrade varanda opcional (metadata por unidade). */
  upgradeVarandaDisponivel?: boolean;
  upgradeVarandaValor?: number;
  /** Premium âncora — produto diferenciado (sem toggle). */
  premiumAncora?: boolean;
}

export interface AcomodacaoRanqueada extends AcomodacaoDisponivel {
  matchPct: number;
  atende: string[];
  difere: string[];
  temExato: boolean;
}

function scoreItem(
  item: AcomodacaoDisponivel,
  criterios: AcomodacaoCriterios,
): { score: number; atende: string[]; difere: string[] } {
  const atende: string[] = [];
  const difere: string[] = [];
  let score = 0;

  if (item.capacidadeMax >= criterios.hospedes) {
    score += 50;
    atende.push(`Capacidade para ${criterios.hospedes} hóspede(s)`);
  } else {
    difere.push(`Capacidade ${item.capacidadeMax} < ${criterios.hospedes} hóspede(s)`);
  }

  const quartosDesejados = criterios.quartosDesejados ?? Math.max(1, Math.ceil(criterios.hospedes / 2));
  const diffQuartos = Math.abs(item.quartos - quartosDesejados);
  if (diffQuartos === 0) {
    atende.push(`${item.quartos} quarto(s)`);
  } else {
    difere.push(`Quartos: ${item.quartos} (ideal ~${quartosDesejados})`);
  }
  score -= diffQuartos * 7;

  const banheiroDesejado = criterios.configBanheiro ?? 'so_wc_social';
  if (item.configBanheiro === banheiroDesejado) {
    score += 12;
    atende.push('Banheiro alinhado');
  } else if (item.configBanheiro === 'suite_wc_social') {
    score += 4;
    difere.push(`Banheiro: ${item.configBanheiro}`);
  } else {
    difere.push(`Banheiro: ${item.configBanheiro}`);
  }

  const salaDesejada = criterios.configSala ?? 'nenhum';
  if (item.configSala === salaDesejada) {
    score += 8;
    if (salaDesejada !== 'nenhum') atende.push('Sala conforme preferência');
  } else if (item.configSala !== 'nenhum') {
    score += 2;
    difere.push(`Sala: ${item.configSala}`);
  }

  const vagasOciosas = Math.max(0, item.capacidadeMax - criterios.hospedes);
  score -= vagasOciosas * 2;

  return { score, atende, difere };
}

export function buscarPorRelevancia(
  criterios: AcomodacaoCriterios,
  disponiveis: AcomodacaoDisponivel[],
): AcomodacaoRanqueada[] {
  if (disponiveis.length === 0) {
    return [];
  }

  const eliminatoria = disponiveis.filter((d) => d.disponivel !== false);
  const pool = eliminatoria.length > 0 ? eliminatoria : disponiveis;

  const ranked = pool
    .map((item) => {
      const { score, atende, difere } = scoreItem(item, criterios);
      const matchPct = Math.max(0, Math.min(100, Math.round(score)));
      const temExato =
        item.capacidadeMax >= criterios.hospedes &&
        difere.filter((d) => !d.startsWith('Capacidade')).length === 0;
      return { ...item, matchPct, atende, difere, temExato };
    })
    .sort((a, b) => b.matchPct - a.matchPct || a.precoDiaria - b.precoDiaria);

  if (ranked.length > 0) return ranked;

  const fallback = disponiveis[0];
  return [
    {
      ...fallback,
      matchPct: 0,
      atende: [],
      difere: ['Mais próximo disponível'],
      temExato: false,
    },
  ];
}
