import { api } from '@/src/lib/api';

export type UrgenciaEstilo = 'countdown' | 'badge' | 'nenhum';

export interface ModuloPropostasConfig {
  validadeCotacaoHoras: number;
  urgenciaEstilo: UrgenciaEstilo;
  avisoExpiracaoHoras: number;
  permitirApenasHotel: boolean;
  disparoAutomatizadoCaldasAi: boolean;
  delayDisparoMinutos: number;
}

export const moduloPropostasApi = {
  get: () =>
    api.get<{ success: boolean; data: ModuloPropostasConfig }>(
      '/api/v1/configuracoes/modulo-propostas',
    ),
  update: (body: Partial<ModuloPropostasConfig>) =>
    api.put<{ success: boolean; data: ModuloPropostasConfig }>(
      '/api/v1/configuracoes/modulo-propostas',
      body,
    ),
};
