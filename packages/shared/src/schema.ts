/**
 * Contratos de schema Fase 1 — alinhados a backend/src/db/schema/*.
 * Tipos locais para @rsv360/shared (sem dependência de compilação do backend).
 */

export type BudgetStatus = 'draft' | 'sent' | 'approved' | 'rejected' | 'expired';

export interface OrcamentoRecord {
  id: number;
  enterpriseId?: number | null;
  codigo?: string | null;
  titulo: string;
  clienteNome: string;
  clienteEmail?: string | null;
  clienteTelefone?: string | null;
  clienteDocumento?: string | null;
  tipo: string;
  categoria?: string | null;
  status: BudgetStatus | string;
  subtotal: string;
  desconto: string;
  descontoTipo?: string | null;
  impostos: string;
  total: string;
  moeda: string;
  validoAte?: Date | null;
  notas?: string | null;
  metadata?: Record<string, unknown> | null;
  criadoPor?: number | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

export interface OrcamentoItemRecord {
  id: number;
  orcamentoId: number;
  nome: string;
  descricao?: string | null;
  categoria?: string | null;
  quantidade: number;
  precoUnitario: string;
  precoTotal: string;
  detalhes?: Record<string, unknown> | null;
  ordem?: number | null;
  createdAt?: Date | null;
}

export interface PropostaRecord {
  id: number;
  enterpriseId?: number | null;
  orcamentoId?: number | null;
  codigo?: string | null;
  titulo: string;
  clienteNome: string;
  clienteEmail?: string | null;
  clienteTelefone?: string | null;
  status: string;
  valorTotal: string;
  moeda: string;
  validoAte?: Date | null;
  versao: number;
  isPublica?: boolean | null;
  conteudo?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

export interface PassageiroRecord {
  id: number;
  enterpriseId?: number | null;
  nome: string;
  email?: string | null;
  telefone?: string | null;
  cpf?: string | null;
  rg?: string | null;
  dataNascimento?: string | null;
  tipo?: string | null;
  documentos?: Record<string, unknown> | null;
  notas?: string | null;
  isActive?: boolean | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

export interface TransacaoRecord {
  id: number;
  enterpriseId?: number | null;
  tipo: string;
  categoria?: string | null;
  descricao: string;
  valor: string;
  moeda: string;
  status: string;
  metodoPagamento?: string | null;
  referenciaTipo?: string | null;
  referenciaId?: number | null;
  dataTransacao: Date;
  metadata?: Record<string, unknown> | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

export interface CampanhaRecord {
  id: number;
  enterpriseId?: number | null;
  nome: string;
  tipo?: string | null;
  status: string;
  orcamento?: string | null;
  gastoAtual?: string | null;
  inicio?: Date | null;
  fim?: Date | null;
  canais?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

export interface TransporteRecord {
  id: number;
  enterpriseId?: number | null;
  tipo: string;
  placa?: string | null;
  modelo?: string | null;
  capacidade: number;
  motorista?: string | null;
  status: string;
  metadata?: Record<string, unknown> | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

export interface RelatorioViewRecord {
  id: number;
  enterpriseId?: number | null;
  userId?: number | null;
  nome: string;
  tipo: string;
  filtros?: Record<string, unknown> | null;
  colunas?: Record<string, unknown> | null;
  isDefault?: boolean | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

/** Nomes das 17 tabelas Fase 1 */
export const FASE1_TABLES = [
  'orcamentos',
  'orcamento_itens',
  'propostas',
  'proposta_eventos',
  'proposta_chat',
  'pacotes_template',
  'passageiros',
  'passageiro_excursao',
  'transacoes',
  'contas_receber',
  'campanhas',
  'cupons',
  'cupons_uso',
  'transportes',
  'embarques',
  'relatorios_views',
  'relatorios_snapshots',
] as const;

export type Fase1TableName = (typeof FASE1_TABLES)[number];
