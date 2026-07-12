import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fase1Api } from '@/lib/fase1-api';

export function useAnfitriaoDashboard() {
  return useQuery({
    queryKey: ['anfitriao', 'dashboard'],
    queryFn: () => fase1Api.anfitriaoDashboard(),
  });
}

export function useAnfitriaoMinhas(page = 1) {
  return useQuery({
    queryKey: ['anfitriao', 'minhas', page],
    queryFn: () => fase1Api.anfitriaoMinhas(page),
  });
}

export function useAnfitriaoMinhasComissoes(page = 1) {
  return useQuery({
    queryKey: ['anfitriao', 'comissoes', page],
    queryFn: () => fase1Api.anfitriaoMinhasComissoes(page),
  });
}

export function useAnfitriaoUnidade(id: number) {
  return useQuery({
    queryKey: ['anfitriao', 'unidade', id],
    queryFn: () => fase1Api.anfitriaoUnidade(id),
    enabled: Number.isFinite(id) && id > 0,
  });
}

export function useAtualizarAnfitriaoUnidade(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => fase1Api.atualizarAnfitriaoUnidade(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['anfitriao'] });
    },
  });
}

export function useAnfitriaoReservas(de: string, ate: string, acomodacaoId?: number) {
  return useQuery({
    queryKey: ['anfitriao', 'reservas', de, ate, acomodacaoId],
    queryFn: () => fase1Api.anfitriaoReservas(de, ate, acomodacaoId),
    enabled: Boolean(de && ate),
  });
}

export function useAnfitriaoCalendario(id: number, de: string, ate: string) {
  return useQuery({
    queryKey: ['anfitriao', 'calendario', id, de, ate],
    queryFn: () => fase1Api.anfitriaoCalendario(id, de, ate),
    enabled: Number.isFinite(id) && id > 0 && Boolean(de && ate),
  });
}

export function useEnviarAprovacaoUnidade(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => fase1Api.enviarAprovacaoUnidade(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['anfitriao'] });
    },
  });
}
