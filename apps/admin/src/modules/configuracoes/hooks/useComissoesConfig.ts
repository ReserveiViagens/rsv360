import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  comissoesConfigApi,
  type ComissoesConfig,
  type ComissoesObjetivoIa,
} from '../api/comissoes.api';

export function useComissoesConfig() {
  return useQuery({
    queryKey: ['comissoes', 'config'],
    queryFn: async () => {
      const res = await comissoesConfigApi.get();
      return res.data;
    },
  });
}

export function useUpdateComissoesConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<ComissoesConfig> & { fonte?: 'manual' | 'ia'; motivoIa?: string }) =>
      comissoesConfigApi.update(body).then((r) => r.data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['comissoes', 'config'] });
    },
  });
}

export function useSugerirComissoesIa() {
  return useMutation({
    mutationFn: (body: { objetivo?: ComissoesObjetivoIa; contexto?: string }) =>
      comissoesConfigApi.sugerirIa(body).then((r) => r.data),
  });
}

export function useSolicitarAprovacaoComissoes() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (
      body: Parameters<typeof comissoesConfigApi.solicitarAprovacao>[0],
    ) => comissoesConfigApi.solicitarAprovacao(body).then((r) => r.data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['comissoes', 'config'] });
    },
  });
}

export function useAprovarSugestaoComissoes() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { confirmouDiff: true; overrideBaixaConfianca?: boolean }) =>
      comissoesConfigApi.aprovarSugestao(body).then((r) => r.data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['comissoes', 'config'] });
    },
  });
}

export function useRejeitarSugestaoComissoes() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body?: { motivo?: string }) =>
      comissoesConfigApi.rejeitarSugestao(body).then((r) => r.data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['comissoes', 'config'] });
    },
  });
}
