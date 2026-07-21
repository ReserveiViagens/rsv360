'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ApiItemResponse, HitlState, Proposta, PropostaChatMessage } from '@/lib/fase1-types';

const BFF = '/api/propostas';

function getAuthHeaders(capabilityToken?: string | null): HeadersInit {
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (typeof window !== 'undefined') {
    const token =
      localStorage.getItem('access_token') ||
      localStorage.getItem('rsv360_access_token') ||
      localStorage.getItem('token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  if (capabilityToken) {
    headers['x-proposta-token'] = capabilityToken;
  }
  return headers;
}

async function fetchJson<T>(
  path: string,
  init?: RequestInit,
  capabilityToken?: string | null,
): Promise<T> {
  const res = await fetch(`${BFF}${path}`, {
    ...init,
    headers: { ...getAuthHeaders(capabilityToken), ...(init?.headers ?? {}) },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || res.statusText);
  return json as T;
}

/** Full public payload via capability token (cotação-pública). */
export function usePropostaByToken(token?: string) {
  return useQuery({
    queryKey: ['propostas', 'token', token],
    queryFn: async () => {
      const res = await fetch(`/api/cotacao/p/${encodeURIComponent(token!)}`, {
        cache: 'no-store',
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || res.statusText);
      return json as ApiItemResponse<Proposta>;
    },
    enabled: Boolean(token && !/^\d+$/.test(token)),
  });
}

/** Numeric :id — anonymous gets redacted only (PR-03b). Prefer usePropostaByToken when rt-* present. */
export function usePropostaPublica(id?: number) {
  return useQuery({
    queryKey: ['propostas', 'public', id],
    queryFn: () => fetchJson<ApiItemResponse<Proposta>>(`/${id}`),
    enabled: Boolean(id),
  });
}

export function usePropostaChat(id?: number, capabilityToken?: string | null) {
  const q = capabilityToken
    ? `/${id}/chat?token=${encodeURIComponent(capabilityToken)}`
    : `/${id}/chat`;
  return useQuery({
    queryKey: ['propostas', id, 'chat', capabilityToken ?? null],
    queryFn: () => fetchJson<ApiItemResponse<PropostaChatMessage[]>>(q, undefined, capabilityToken),
    enabled: Boolean(id && capabilityToken),
    refetchInterval: 30_000,
  });
}

export function usePropostaHitl(id?: number, capabilityToken?: string | null) {
  const q = capabilityToken
    ? `/${id}/hitl?token=${encodeURIComponent(capabilityToken)}`
    : `/${id}/hitl`;
  return useQuery({
    queryKey: ['propostas', id, 'hitl', capabilityToken ?? null],
    queryFn: () => fetchJson<ApiItemResponse<HitlState>>(q, undefined, capabilityToken),
    enabled: Boolean(id && capabilityToken),
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
      tokenPublico,
    }: {
      id: number;
      action: 'accept' | 'reject';
      clientName?: string;
      turnstileToken?: string;
      tokenPublico?: string;
    }) =>
      fetchJson<ApiItemResponse<Proposta>>(
        `/${id}/responder`,
        {
          method: 'POST',
          body: JSON.stringify({ action, clientName, turnstileToken, tokenPublico }),
        },
        tokenPublico,
      ),
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
      tokenPublico,
    }: {
      id: number;
      message: string;
      senderName?: string;
      senderType?: string;
      turnstileToken?: string;
      tokenPublico?: string;
    }) =>
      fetchJson<ApiItemResponse<PropostaChatMessage>>(
        `/${id}/chat`,
        {
          method: 'POST',
          body: JSON.stringify({
            message,
            senderName,
            senderType: senderType ?? 'client',
            turnstileToken,
            tokenPublico,
          }),
        },
        tokenPublico,
      ),
    onSuccess: async (_data, vars) => {
      await qc.invalidateQueries({ queryKey: ['propostas', vars.id, 'chat'] });
    },
  });
}

export function useSolicitarHitl() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      clientName,
      tokenPublico,
    }: {
      id: number;
      clientName?: string;
      tokenPublico?: string;
    }) =>
      fetchJson<ApiItemResponse<HitlState>>(
        `/${id}/hitl/request`,
        {
          method: 'POST',
          body: JSON.stringify({ clientName, tokenPublico }),
        },
        tokenPublico,
      ),
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
