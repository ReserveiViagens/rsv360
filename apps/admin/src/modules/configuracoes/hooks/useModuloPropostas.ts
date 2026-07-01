import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  moduloPropostasApi,
  type ModuloPropostasConfig,
} from '../api/modulo-propostas.api';

const QUERY_KEY = ['configuracoes', 'modulo-propostas'] as const;

export function useModuloPropostasConfig() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const res = await moduloPropostasApi.get();
      return res.data;
    },
  });
}

export function useUpdateModuloPropostas() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<ModuloPropostasConfig>) => moduloPropostasApi.update(body),
    onSuccess: (res) => {
      qc.setQueryData(QUERY_KEY, res.data);
    },
  });
}
