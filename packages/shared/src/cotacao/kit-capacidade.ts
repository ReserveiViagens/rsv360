/** Limites estáticos dos kits do catálogo (fallback até tipologia DB no Passo 6). */
export const KIT_CAPACIDADE_FALLBACK: Record<string, number> = {
  'kit-casal': 2,
  'kit-familia': 6,
  'kit-individual': 1,
};

export function resolveKitCapacidadeMax(
  kitId: string,
  capacidadeMax?: number | null,
): number {
  if (capacidadeMax != null && capacidadeMax > 0) return capacidadeMax;
  return KIT_CAPACIDADE_FALLBACK[kitId] ?? 99;
}

export function kitEstouraCapacidade(
  kitId: string,
  guests: number,
  capacidadeMax?: number | null,
): boolean {
  if (!kitId) return false;
  return guests > resolveKitCapacidadeMax(kitId, capacidadeMax);
}

export function sugerirKitAlternativo(guests: number): string {
  if (guests <= 1) return 'kit-individual';
  if (guests <= 2) return 'kit-casal';
  return 'kit-familia';
}

export function revalidarKitSelecionado(
  kitId: string | null,
  guests: number,
  capacidadeMax?: number | null,
): { limpar: boolean; sugestaoKitId?: string } {
  if (!kitId) return { limpar: false };
  if (!kitEstouraCapacidade(kitId, guests, capacidadeMax)) return { limpar: false };
  return { limpar: true, sugestaoKitId: sugerirKitAlternativo(guests) };
}
