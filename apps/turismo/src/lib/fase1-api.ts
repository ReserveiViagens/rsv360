import { DEFAULT_API_URL } from './auth-v1';

export const FASE1_API_BASE = DEFAULT_API_URL;

function getToken(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('access_token') || localStorage.getItem('token') || '';
}

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${FASE1_API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      ...(init?.headers ?? {}),
    },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || json.message || res.statusText);
  return json as T;
}

export const fase1Api = {
  // Orçamentos
  listOrcamentos: () => fetchJson<{ success: boolean; data: unknown[] }>('/api/v1/orcamentos'),
  getOrcamento: (id: number) => fetchJson<{ success: boolean; data: unknown }>(`/api/v1/orcamentos/${id}`),
  createOrcamento: (body: Record<string, unknown>) =>
    fetchJson('/api/v1/orcamentos', { method: 'POST', body: JSON.stringify(body) }),
  updateOrcamento: (id: number, body: Record<string, unknown>) =>
    fetchJson(`/api/v1/orcamentos/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteOrcamento: (id: number) => fetchJson(`/api/v1/orcamentos/${id}`, { method: 'DELETE' }),
  addOrcamentoItem: (id: number, body: Record<string, unknown>) =>
    fetchJson(`/api/v1/orcamentos/${id}/itens`, { method: 'POST', body: JSON.stringify(body) }),
  convertOrcamento: (id: number) =>
    fetchJson(`/api/v1/orcamentos/${id}/converter-proposta`, { method: 'POST', body: '{}' }),

  // Propostas
  listPropostas: (status?: string) =>
    fetchJson<{ success: boolean; data: unknown[] }>(
      `/api/v1/propostas${status ? `?status=${status}` : ''}`,
    ),
  getProposta: (id: number) => fetchJson<{ success: boolean; data: unknown }>(`/api/v1/propostas/${id}`),
  createProposta: (body: Record<string, unknown>) =>
    fetchJson('/api/v1/propostas', { method: 'POST', body: JSON.stringify(body) }),
  updateProposta: (id: number, body: Record<string, unknown>) =>
    fetchJson(`/api/v1/propostas/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  listTemplates: () => fetchJson<{ success: boolean; data: unknown[] }>('/api/v1/propostas/templates'),
  getHitl: (id: number) => fetchJson<{ success: boolean; data: unknown }>(`/api/v1/propostas/${id}/hitl`),
  takeoverHitl: (id: number) =>
    fetchJson(`/api/v1/propostas/${id}/hitl/takeover`, { method: 'POST', body: '{}' }),
  releaseHitl: (id: number) =>
    fetchJson(`/api/v1/propostas/${id}/hitl/release`, { method: 'POST', body: '{}' }),

  // Passageiros
  listPassageiros: () => fetchJson<{ success: boolean; data: unknown[] }>('/api/v1/passageiros'),
  getPassageiro: (id: number) => fetchJson<{ success: boolean; data: unknown }>(`/api/v1/passageiros/${id}`),
  createPassageiro: (body: Record<string, unknown>) =>
    fetchJson('/api/v1/passageiros', { method: 'POST', body: JSON.stringify(body) }),
  updatePassageiro: (id: number, body: Record<string, unknown>) =>
    fetchJson(`/api/v1/passageiros/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  createFnrh: (passageiroId: number, body: Record<string, unknown>) =>
    fetchJson(`/api/v1/passageiros/${passageiroId}/fnrh`, { method: 'POST', body: JSON.stringify(body) }),

  // Financeiro
  financeiroDashboard: () => fetchJson<{ success: boolean; data: unknown }>('/api/v1/financeiro/dashboard'),
  fluxoCaixa: () => fetchJson<{ success: boolean; data: unknown }>('/api/v1/financeiro/fluxo-caixa'),
  listTransacoes: () => fetchJson<{ success: boolean; data: unknown[] }>('/api/v1/financeiro/transacoes'),
  createTransacao: (body: Record<string, unknown>) =>
    fetchJson('/api/v1/financeiro/transacoes', { method: 'POST', body: JSON.stringify(body) }),
  listContasReceber: () => fetchJson<{ success: boolean; data: unknown[] }>('/api/v1/financeiro/contas-receber'),
  listContasPagar: () => fetchJson<{ success: boolean; data: unknown[] }>('/api/v1/financeiro/contas-pagar'),

  // Campanhas
  listCampanhas: () => fetchJson<{ success: boolean; data: unknown[] }>('/api/v1/campanhas'),
  campanhasMetricas: () => fetchJson<{ success: boolean; data: unknown }>('/api/v1/campanhas/metricas'),
  createCampanha: (body: Record<string, unknown>) =>
    fetchJson('/api/v1/campanhas', { method: 'POST', body: JSON.stringify(body) }),
  listCupons: () => fetchJson<{ success: boolean; data: unknown[] }>('/api/v1/campanhas/cupons'),

  // Logística
  logisticaDashboard: () => fetchJson<{ success: boolean; data: unknown }>('/api/v1/logistica'),
  listFornecedores: () => fetchJson<{ success: boolean; data: unknown[] }>('/api/v1/logistica/fornecedores'),
  listReservas: () => fetchJson<{ success: boolean; data: unknown[] }>('/api/v1/logistica/reservas'),
  listVouchers: () => fetchJson<{ success: boolean; data: unknown[] }>('/api/v1/logistica/vouchers'),
  createVoucher: (body: Record<string, unknown>) =>
    fetchJson('/api/v1/logistica/vouchers', { method: 'POST', body: JSON.stringify(body) }),

  // Relatórios
  relatoriosDashboard: () => fetchJson<{ success: boolean; data: unknown }>('/api/v1/relatorios/dashboard'),
  exportCsvUrl: (tipo: string) => `${FASE1_API_BASE}/api/v1/relatorios/export/csv?tipo=${tipo}`,
  exportPdfUrl: (tipo: string) => `${FASE1_API_BASE}/api/v1/relatorios/export/pdf?tipo=${tipo}`,

  // Configurações — modulo_propostas (configuracoes_sistema)
  getModuloPropostas: () =>
    fetchJson<{
      success: boolean;
      data: {
        validadeCotacaoHoras: number;
        urgenciaEstilo: 'countdown' | 'badge' | 'nenhum';
        avisoExpiracaoHoras: number;
        permitirApenasHotel?: boolean;
        disparoAutomatizadoCaldasAi?: boolean;
        delayDisparoMinutos?: number;
      };
    }>('/api/v1/configuracoes/modulo-propostas'),
  updateModuloPropostas: (body: {
    validadeCotacaoHoras?: number;
    urgenciaEstilo?: 'countdown' | 'badge' | 'nenhum';
    avisoExpiracaoHoras?: number;
  }) =>
    fetchJson('/api/v1/configuracoes/modulo-propostas', {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  // Anfitrião / parceiros (PR 24B)
  anfitriaoDashboard: () =>
    fetchJson<{ success: boolean; data: { total: number; incompletas: number; emAprovacao: number; publicadas: number } }>(
      '/api/v1/acomodacoes/anfitriao/dashboard',
    ),
  anfitriaoMinhas: (page = 1) =>
    fetchJson<{ success: boolean; data: { items: unknown[]; total: number; page: number; pageSize: number } }>(
      `/api/v1/acomodacoes/anfitriao/minhas?page=${page}`,
    ),
  anfitriaoMinhasComissoes: (page = 1) =>
    fetchJson<{
      success: boolean;
      data: {
        items: Array<{
          id: number;
          propostaId: number;
          acomodacaoId: number | null;
          papel: string;
          baseValor: string;
          percentual: string;
          valorComissao: string;
          status: string;
          propostaCodigo: string | null;
          propostaTitulo: string;
          criadoEm: string | null;
        }>;
        page: number;
        pageSize: number;
        moduloAtivo: boolean;
      };
    }>(`/api/v1/comissoes/minhas-comissoes?page=${page}`),
  anfitriaoUnidade: (id: number) =>
    fetchJson<{ success: boolean; data: unknown }>(`/api/v1/acomodacoes/anfitriao/unidades/${id}`),
  atualizarAnfitriaoUnidade: (id: number, body: Record<string, unknown>) =>
    fetchJson(`/api/v1/acomodacoes/anfitriao/unidades/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  enviarAprovacaoUnidade: (id: number) =>
    fetchJson(`/api/v1/acomodacoes/anfitriao/unidades/${id}/enviar-aprovacao`, {
      method: 'POST',
      body: '{}',
    }),

  anfitriaoDisponibilidade: (id: number, de: string, ate: string) =>
    fetchJson<{ success: boolean; data: unknown[] }>(
      `/api/v1/acomodacoes/anfitriao/unidades/${id}/disponibilidade?de=${de}&ate=${ate}`,
    ),

  anfitriaoCalendario: (id: number, de: string, ate: string) =>
    fetchJson<{
      success: boolean;
      data: Array<{
        data: string;
        estado: 'livre' | 'bloqueado' | 'reservado';
        disponivel: boolean;
        precoOverride: string | null;
        observacao: string | null;
        readOnly: boolean;
      }>;
    }>(`/api/v1/acomodacoes/anfitriao/unidades/${id}/calendario?de=${de}&ate=${ate}`),

  anfitriaoReservas: (de: string, ate: string, acomodacaoId?: number) => {
    const qs = new URLSearchParams({ de, ate });
    if (acomodacaoId != null) qs.set('acomodacaoId', String(acomodacaoId));
    return fetchJson<{ success: boolean; data: unknown[] }>(
      `/api/v1/acomodacoes/anfitriao/reservas?${qs.toString()}`,
    );
  },

  salvarAnfitriaoDisponibilidade: (
    id: number,
    dias: Array<{ data: string; disponivel: boolean; precoOverride?: string; observacao?: string }>,
  ) =>
    fetchJson(`/api/v1/acomodacoes/anfitriao/unidades/${id}/disponibilidade`, {
      method: 'PUT',
      body: JSON.stringify({ dias }),
    }),

  importPreview: async (file: File) => {
    const form = new FormData();
    form.append('file', file);
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'}/api/v1/acomodacoes/import/preview`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Preview falhou');
    return res.json();
  },

  importCommit: async (file: File) => {
    const form = new FormData();
    form.append('file', file);
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'}/api/v1/acomodacoes/import/commit`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Commit falhou');
    return res.json();
  },

  tarifasConfig: () => fetchJson<{ success: boolean; data: { tarifarioDinamicoAtivo: boolean } }>('/api/v1/tarifas/config'),
  tarifasSetConfig: (tarifarioDinamicoAtivo: boolean) =>
    fetchJson('/api/v1/tarifas/config', {
      method: 'PATCH',
      body: JSON.stringify({ tarifarioDinamicoAtivo }),
    }),
  tarifasCategorias: () => fetchJson<{ success: boolean; data: unknown[] }>('/api/v1/tarifas/categorias'),
  tarifasTemporadas: () => fetchJson<{ success: boolean; data: unknown[] }>('/api/v1/tarifas/temporadas'),
  tarifasRegras: () => fetchJson<{ success: boolean; data: unknown[] }>('/api/v1/tarifas/regras'),
  tarifasSimular: (acomodacaoId: number, data: string, categoria = 'padrao') =>
    fetchJson<{ success: boolean; data: unknown }>(
      `/api/v1/tarifas/simular?acomodacaoId=${acomodacaoId}&data=${data}&categoria=${categoria}`,
    ),
};

export function getWsBaseUrl(): string {
  return process.env.NEXT_PUBLIC_WS_URL || FASE1_API_BASE;
}
