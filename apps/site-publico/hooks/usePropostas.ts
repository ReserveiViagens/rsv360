'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ApiItemResponse, HitlState, Proposta, PropostaChatMessage } from '@/lib/fase1-types';

const BFF = '/api/propostas';

function getAuthHeaders(): HeadersInit {
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (typeof window !== 'undefined') {
    const token =
      localStorage.getItem('access_token') ||
      localStorage.getItem('rsv360_access_token') ||
      localStorage.getItem('token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BFF}${path}`, {
    ...init,
    headers: { ...getAuthHeaders(), ...(init?.headers ?? {}) },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || res.statusText);
  return json as T;
}

export function usePropostaPublica(id?: number) {
  return useQuery({
    queryKey: ['propostas', 'public', id],
    queryFn: () => fetchJson<ApiItemResponse<Proposta>>(`/${id}`),
    enabled: Boolean(id),
  });
}

export function usePropostaChat(id?: number) {
  return useQuery({
    queryKey: ['propostas', id, 'chat'],
    queryFn: () => fetchJson<ApiItemResponse<PropostaChatMessage[]>>(`/${id}/chat`),
    enabled: Boolean(id),
    refetchInterval: 30_000,
  });
}

export function usePropostaHitl(id?: number) {
  return useQuery({
    queryKey: ['propostas', id, 'hitl'],
    queryFn: () => fetchJson<ApiItemResponse<HitlState>>(`/${id}/hitl`),
    enabled: Boolean(id),
  });
}

export function useAceitarPropostaPublica() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      token,
      clientName,
      turnstileToken,
    }: {
      token: string;
      clientName?: string;
      turnstileToken?: string;
    }) => {
      const res = await fetch(`/api/cotacao/proposta/${encodeURIComponent(token)}/aceitar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientName, turnstileToken }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || res.statusText);
      return json as {
        success: boolean;
        data: { proximoDestino?: string; proposta?: Proposta };
      };
    },
    onSuccess: async (data) => {
      const id = data.data?.proposta?.id;
      if (id) {
        await qc.invalidateQueries({ queryKey: ['propostas', 'public', id] });
      }
    },
  });
}

export function useResponderProposta() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      action,
      clientName,
      turnstileToken,
    }: {
      id: number;
      action: 'accept' | 'reject';
      clientName?: string;
      turnstileToken?: string;
    }) =>
      fetchJson<ApiItemResponse<Proposta>>(`/${id}/responder`, {
        method: 'POST',
        body: JSON.stringify({ action, clientName, turnstileToken }),
      }),
    onSuccess: async (_data, vars) => {
      await qc.invalidateQueries({ queryKey: ['propostas', 'public', vars.id] });
    },
  });
}

export function useEnviarChatProposta() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      message,
      senderName,
      senderType,
      turnstileToken,
    }: {
      id: number;
      message: string;
      senderName?: string;
      senderType?: string;
      turnstileToken?: string;
    }) =>
      fetchJson<ApiItemResponse<PropostaChatMessage>>(`/${id}/chat`, {
        method: 'POST',
        body: JSON.stringify({
          message,
          senderName,
          senderType: senderType ?? 'client',
          turnstileToken,
        }),
      }),
    onSuccess: async (_data, vars) => {
      await qc.invalidateQueries({ queryKey: ['propostas', vars.id, 'chat'] });
    },
  });
}

export function useSolicitarHitl() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, clientName }: { id: number; clientName?: string }) =>
      fetchJson<ApiItemResponse<HitlState>>(`/${id}/hitl/request`, {
        method: 'POST',
        body: JSON.stringify({ clientName }),
      }),
    onSuccess: async (_data, vars) => {
      await qc.invalidateQueries({ queryKey: ['propostas', vars.id, 'hitl'] });
    },
  });
}

export function getPropostaWsUrl(): string {
  if (typeof window === 'undefined') return '';
  return (
    process.env.NEXT_PUBLIC_WS_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    'http://localhost:3002'
  );
}
