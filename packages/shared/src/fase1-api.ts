/** Tipos e paths da API v1 — módulos Fase 1 (migração Sistema A → B). */

export const FASE1_API_URL =
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_URL) ||
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_BACKEND_URL) ||
  'http://localhost:3002';

export const FASE1_MODULES = {
  orcamentos: '/api/v1/orcamentos',
  propostas: '/api/v1/propostas',
  passageiros: '/api/v1/passageiros',
  financeiro: '/api/v1/financeiro',
  campanhas: '/api/v1/campanhas',
  logistica: '/api/v1/logistica',
  relatorios: '/api/v1/relatorios',
} as const;

export type HitlMode = 'ai' | 'waiting' | 'human';

export interface Proposta {
  id: number;
  enterpriseId?: number | null;
  orcamentoId?: number | null;
  codigo?: string | null;
  titulo: string;
  clienteNome: string;
  clienteEmail?: string | null;
  clienteTelefone?: string | null;
  status: string;
  valorTotal: string | number;
  moeda: string;
  validoAte?: string | null;
  versao: number;
  isPublica?: boolean | null;
  conteudo?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  eventos?: PropostaEvento[];
  chat?: PropostaChatMessage[];
}

export interface PropostaEvento {
  id: number;
  propostaId: number;
  tipo: string;
  descricao?: string | null;
  payload?: Record<string, unknown> | null;
  actorId?: number | null;
  createdAt?: string | null;
}

export interface PropostaChatMessage {
  id: number;
  propostaId: number;
  senderType: string;
  senderName?: string | null;
  message: string;
  createdAt?: string | null;
}

export interface HitlState {
  propostaId: number;
  hitlMode: HitlMode;
  assignedAgentId?: number | null;
  assignedAgentName?: string | null;
}

export interface Orcamento {
  id: number;
  titulo: string;
  clienteNome: string;
  clienteEmail?: string | null;
  status: string;
  total: string | number;
  moeda: string;
  createdAt?: string | null;
}

export interface ApiListResponse<T> {
  success: boolean;
  data: T[];
  total?: number;
}

export interface ApiItemResponse<T> {
  success: boolean;
  data: T;
}
