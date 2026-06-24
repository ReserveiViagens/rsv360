import { api } from '@/src/lib/api';

const ENDPOINTS: Record<string, string> = {
  orcamentos: '/api/v1/orcamentos',
  propostas: '/api/v1/propostas',
  passageiros: '/api/v1/passageiros',
  campanhas: '/api/v1/campanhas',
  financeiro: '/api/v1/financeiro/dashboard',
  logistica: '/api/v1/logistica',
  relatorios: '/api/v1/relatorios/dashboard',
};

export type Fase1ListResponse = {
  success: boolean;
  data: Record<string, unknown>[] | Record<string, unknown>;
  total?: number;
};

export type Fase1ModuleKey = keyof typeof ENDPOINTS;

export const fase1AdminApi = {
  list: (module: Fase1ModuleKey): Promise<Fase1ListResponse> => {
    const path = ENDPOINTS[module];
    return api.get<Fase1ListResponse>(path);
  },
  health: (module: Fase1ModuleKey) => {
    const base = ENDPOINTS[module].replace('/dashboard', '');
    return api.get<{ module: string; status: string }>(`${base}/health`);
  },
};
