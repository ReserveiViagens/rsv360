import { api } from '@/src/lib/api';

const MODULES = {
  orcamentos: '/api/v1/orcamentos',
  propostas: '/api/v1/propostas',
  passageiros: '/api/v1/passageiros',
  financeiro: '/api/v1/financeiro',
  campanhas: '/api/v1/campanhas',
  logistica: '/api/v1/logistica',
  relatorios: '/api/v1/relatorios',
} as const;

export type Fase1ModuleKey = keyof typeof MODULES;

export const fase1AdminApi = {
  list: (module: Fase1ModuleKey) =>
    api.get<{ success: boolean; data: Record<string, unknown>[]; total?: number }>(MODULES[module]),
  health: (module: Fase1ModuleKey) =>
    api.get<{ module: string; status: string }>(`${MODULES[module]}/health`),
};
