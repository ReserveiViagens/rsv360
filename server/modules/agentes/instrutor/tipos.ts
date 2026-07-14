export type InstrutorPapel = 'staff' | 'anfitriao' | 'ambos';

export type GuiaFrontMatter = {
  id: string;
  titulo: string;
  papel: InstrutorPapel;
  rotas: string[];
  versao_base: string;
};

export type GuiaCarregado = GuiaFrontMatter & {
  slug: string;
  corpo: string;
  emConstrucao: boolean;
};

export type InstrutorResposta = {
  resposta: string;
  tier: 't0' | 't1';
  cacheHit: 'exact' | 'semantic' | 'none';
  status: 200 | 503;
};

export const AGENTE_INSTRUTOR = 'instrutor';
export const VERSAO_BASE_PADRAO = '2026-07-13';

export function normalizePergunta(s: string): string {
  return s
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s/]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
