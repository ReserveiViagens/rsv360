import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fase1Api } from '../lib/fase1-api';

export function usePropostas(status?: string) {
  return useQuery({
    queryKey: ['propostas', status],
    queryFn: () => fase1Api.listPropostas(status ? { status } : undefined),
  });
}

export function useProposta(id?: number) {
  return useQuery({
    queryKey: ['propostas', id],
    queryFn: () => fase1Api.getProposta(Number(id)),
    enabled: Boolean(id),
  });
}

export function useCreateProposta() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fase1Api.createProposta,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['propostas'] }),
  });
}

export function useUpdateProposta() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: Record<string, unknown> }) => fase1Api.updateProposta(id, body),
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ['propostas'] });
      qc.invalidateQueries({ queryKey: ['propostas', v.id] });
    },
  });
}

export function useChangePropostaStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => fase1Api.changePropostaStatus(id, status),
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ['propostas'] });
      qc.invalidateQueries({ queryKey: ['propostas', v.id] });
    },
  });
}

export function useCreatePropostaFromOrcamento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (orcamentoId: number) => fase1Api.createFromOrcamento(orcamentoId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['propostas'] }),
  });
}

export function usePropostaHitl(id?: number) {
  return useQuery({
    queryKey: ['propostas', id, 'hitl'],
    queryFn: () => fase1Api.getHitl(Number(id)),
    enabled: Boolean(id),
    refetchInterval: 10_000,
  });
}

export function useTakeoverHitl() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => fase1Api.takeoverHitl(id),
    onSuccess: (_d, id) => qc.invalidateQueries({ queryKey: ['propostas', id, 'hitl'] }),
  });
}

export function useReleaseHitl() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => fase1Api.releaseHitl(id),
    onSuccess: (_d, id) => qc.invalidateQueries({ queryKey: ['propostas', id, 'hitl'] }),
  });
}

export function useOrcamentos() {
  return useQuery({ queryKey: ['orcamentos'], queryFn: fase1Api.listOrcamentos });
}

export function useOrcamento(id?: number) {
  return useQuery({
    queryKey: ['orcamentos', id],
    queryFn: () => fase1Api.getOrcamento(Number(id)),
    enabled: Boolean(id),
  });
}
