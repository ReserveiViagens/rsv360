import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fase1Api } from '../lib/fase1-api';

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

export function useCreateOrcamento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fase1Api.createOrcamento,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orcamentos'] }),
  });
}

export function useConvertOrcamento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => fase1Api.convertOrcamento(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orcamentos'] });
      qc.invalidateQueries({ queryKey: ['propostas'] });
    },
  });
}

export function usePropostas(status?: string) {
  return useQuery({
    queryKey: ['propostas', status],
    queryFn: () => fase1Api.listPropostas(status),
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
    mutationFn: ({ id, body }: { id: number; body: Record<string, unknown> }) =>
      fase1Api.updateProposta(id, body),
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ['propostas'] });
      qc.invalidateQueries({ queryKey: ['propostas', v.id] });
    },
  });
}

export function usePropostaTemplates() {
  return useQuery({ queryKey: ['propostas', 'templates'], queryFn: fase1Api.listTemplates });
}

export function usePassageiros() {
  return useQuery({ queryKey: ['passageiros'], queryFn: fase1Api.listPassageiros });
}

export function usePassageiro(id?: number) {
  return useQuery({
    queryKey: ['passageiros', id],
    queryFn: () => fase1Api.getPassageiro(Number(id)),
    enabled: Boolean(id),
  });
}

export function useCreatePassageiro() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fase1Api.createPassageiro,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['passageiros'] }),
  });
}

export function useFinanceiroDashboard() {
  return useQuery({ queryKey: ['financeiro', 'dashboard'], queryFn: fase1Api.financeiroDashboard });
}

export function useFluxoCaixa() {
  return useQuery({ queryKey: ['financeiro', 'fluxo'], queryFn: fase1Api.fluxoCaixa });
}

export function useTransacoes() {
  return useQuery({ queryKey: ['financeiro', 'transacoes'], queryFn: fase1Api.listTransacoes });
}

export function useCampanhas() {
  return useQuery({ queryKey: ['campanhas'], queryFn: fase1Api.listCampanhas });
}

export function useCampanhasMetricas() {
  return useQuery({ queryKey: ['campanhas', 'metricas'], queryFn: fase1Api.campanhasMetricas });
}

export function useCupons() {
  return useQuery({ queryKey: ['cupons'], queryFn: fase1Api.listCupons });
}

export function useLogisticaDashboard() {
  return useQuery({ queryKey: ['logistica'], queryFn: fase1Api.logisticaDashboard });
}

export function useFornecedores() {
  return useQuery({ queryKey: ['logistica', 'fornecedores'], queryFn: fase1Api.listFornecedores });
}

export function useVouchers() {
  return useQuery({ queryKey: ['logistica', 'vouchers'], queryFn: fase1Api.listVouchers });
}

export function useRelatoriosDashboard() {
  return useQuery({ queryKey: ['relatorios'], queryFn: fase1Api.relatoriosDashboard });
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

export function useChangePropostaStatus() {
  const update = useUpdateProposta();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      update.mutateAsync({ id, body: { status } }),
  });
}

export function useCreatePropostaFromOrcamento() {
  return useConvertOrcamento();
}
