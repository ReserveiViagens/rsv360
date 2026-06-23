import { DEFAULT_API_URL } from './auth-v1';
import type { ApiItemResponse, ApiListResponse, HitlState, Orcamento, Proposta } from '@rsv360/shared';

export const FASE1_API_BASE = DEFAULT_API_URL;

function getToken(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('access_token') || localStorage.getItem('token') || '';
}

function headers(): HeadersInit {
  const h: HeadersInit = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) h['Authorization'] = `Bearer ${token}`;
  return h;
}

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${FASE1_API_BASE}${path}`, {
    ...init,
    headers: { ...headers(), ...(init?.headers ?? {}) },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || json.message || res.statusText);
  return json as T;
}

export const fase1Api = {
  listPropostas: (params?: { status?: string }) => {
    const q = params?.status ? `?status=${params.status}` : '';
    return fetchJson<ApiListResponse<Proposta>>(`/api/v1/propostas${q}`);
  },
  getProposta: (id: number) => fetchJson<ApiItemResponse<Proposta>>(`/api/v1/propostas/${id}`),
  createProposta: (body: Record<string, unknown>) =>
    fetchJson<ApiItemResponse<Proposta>>('/api/v1/propostas', { method: 'POST', body: JSON.stringify(body) }),
  updateProposta: (id: number, body: Record<string, unknown>) =>
    fetchJson<ApiItemResponse<Proposta>>(`/api/v1/propostas/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  changePropostaStatus: (id: number, status: string) =>
    fetchJson<ApiItemResponse<Proposta>>(`/api/v1/propostas/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  createFromOrcamento: (orcamentoId: number) =>
    fetchJson<ApiItemResponse<Proposta>>(`/api/v1/propostas/from-orcamento/${orcamentoId}`, { method: 'POST' }),
  getHitl: (id: number) => fetchJson<ApiItemResponse<HitlState>>(`/api/v1/propostas/${id}/hitl`),
  takeoverHitl: (id: number) =>
    fetchJson<ApiItemResponse<HitlState>>(`/api/v1/propostas/${id}/hitl/takeover`, { method: 'POST', body: '{}' }),
  releaseHitl: (id: number) =>
    fetchJson<ApiItemResponse<HitlState>>(`/api/v1/propostas/${id}/hitl/release`, { method: 'POST', body: '{}' }),
  listOrcamentos: () => fetchJson<ApiListResponse<Orcamento>>('/api/v1/orcamentos'),
  getOrcamento: (id: number) => fetchJson<ApiItemResponse<Orcamento>>(`/api/v1/orcamentos/${id}`),
};

export function getWsBaseUrl(): string {
  return process.env.NEXT_PUBLIC_WS_URL || FASE1_API_BASE;
}
