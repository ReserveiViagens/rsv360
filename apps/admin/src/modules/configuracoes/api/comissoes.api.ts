import { api } from '@/src/lib/api';

export type ComissoesFonteAlteracao = 'manual' | 'ia';

export interface RegraComissaoAplicada {
  fonte: 'manual' | 'ia' | 'oficial_reservei_2026';
  atualizadoEm: string;
  motivoIa?: string;
  marca: string;
  split: {
    plataforma: number;
    corretor: number;
    proprietario: number;
  };
}

export interface ComissoesConfig {
  comissoesModuloAtivo: boolean;
  taxaPlataformaPct: number;
  taxaCorretorPct: number;
  margemProprietarioPct: number;
  regraAplicada?: RegraComissaoAplicada;
}

export type ComissoesObjetivoIa =
  | 'padrao'
  | 'captar_corretores'
  | 'max_margem_plataforma'
  | 'competir_otas';

export interface ComissoesSugestaoIa {
  taxaPlataformaPct: number;
  taxaCorretorPct: number;
  margemProprietarioPct: number;
  fonte: 'oficial_reservei' | 'heuristica' | 'openai';
  confianca: number;
  motivo: string;
}

export const comissoesConfigApi = {
  get: () => api.get<{ success: boolean; data: ComissoesConfig }>('/api/v1/comissoes/config'),
  update: (body: Partial<ComissoesConfig> & { fonte?: ComissoesFonteAlteracao; motivoIa?: string }) =>
    api.put<{ success: boolean; data: ComissoesConfig }>('/api/v1/comissoes/config', body),
  sugerirIa: (body: { objetivo?: ComissoesObjetivoIa; contexto?: string }) =>
    api.post<{ success: boolean; data: ComissoesSugestaoIa }>(
      '/api/v1/comissoes/sugerir-percentuais',
      body,
    ),
};
