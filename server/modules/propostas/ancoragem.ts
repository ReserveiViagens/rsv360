import type { OfertaNormalizada } from '@rsv360/shared';

export type ResultadoAncoragem = {
  comparativo: OfertaNormalizada[];
  /** Sempre false na montagem — PR 7 revela sob demanda. */
  exibirComparativo: false;
  temAncora: boolean;
};

export function precoValido(preco: number): boolean {
  return Number.isFinite(preco) && preco > 0;
}

/**
 * Filtro CDC/CONAR: só concorrentes **estritamente** mais caros que a agência.
 * Empate e mais baratos são descartados; preços inválidos ignorados.
 */
export function aplicarFiltroGarantia(
  precoAgencia: number,
  ofertas: OfertaNormalizada[],
): ResultadoAncoragem {
  if (!precoValido(precoAgencia)) {
    return { comparativo: [], exibirComparativo: false, temAncora: false };
  }

  const comparativo = ofertas
    .filter((o) => precoValido(o.preco) && o.preco > precoAgencia)
    .sort((a, b) => a.preco - b.preco);

  return {
    comparativo,
    exibirComparativo: false,
    temAncora: comparativo.length > 0,
  };
}
