/** Tipos locais Fase 1 (espelham @rsv360/shared/fase1-api). */

export type HitlMode = 'ai' | 'waiting' | 'human';

export interface Proposta {
  id: number;
  titulo: string;
  clienteNome: string;
  clienteEmail?: string | null;
  status: string;
  valorTotal: string | number;
  moeda: string;
  validoAte?: string | null;
  isPublica?: boolean | null;
  conteudo?: Record<string, unknown> | null;
  orcamentoId?: number | null;
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

export interface ApiItemResponse<T> {
  success: boolean;
  data: T;
}

export interface ApiListResponse<T> {
  success: boolean;
  data: T[];
  total?: number;
}
