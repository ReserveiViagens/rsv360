import { z } from 'zod';

/** §19.9 — contrato canônico de importação de acomodações. */
export const configSalaImportSchema = z.enum(['nenhum', 'cama_na_sala', 'sofa_cama']);
export const configBanheiroImportSchema = z.enum([
  'suite_wc_social',
  'so_suite',
  'so_wc_social',
]);

function coerceNullableNumber(val: unknown): unknown {
  if (val === null || val === undefined) return null;
  if (typeof val === 'string' && val.trim() === '') return null;
  return val;
}

export const acomodacaoImportSchema = z.object({
  codigoExterno: z.string().max(128).optional().nullable(),
  empreendimento: z.string().min(1, 'empreendimento obrigatório'),
  tipo: z.string().min(1, 'tipo obrigatório'),
  titulo: z.string().min(1).max(255),
  quartos: z.coerce.number().int().min(0).default(1),
  capacidadeMax: z.coerce.number().int().min(1, 'capacidade_max obrigatória'),
  capacidadeBase: z.coerce.number().int().min(1).optional().nullable(),
  configSala: configSalaImportSchema.default('nenhum'),
  configBanheiro: configBanheiroImportSchema.default('so_wc_social'),
  precoDiaria: z.preprocess(
    coerceNullableNumber,
    z.coerce.number().min(0).optional().nullable(),
  ),
  utensilios: z.array(z.string()).optional().default([]),
  eletrodomesticos: z.array(z.string()).optional().default([]),
  amenidades: z.array(z.string()).optional().default([]),
  midia: z.array(z.string()).optional().default([]),
  fonte: z.string().max(128).optional().nullable(),
  obs: z.string().max(2000).optional().nullable(),
});

export type AcomodacaoImportDTO = z.infer<typeof acomodacaoImportSchema>;

export interface AcomodacaoImportResolved extends AcomodacaoImportDTO {
  hotelId: string;
  tipoId: number;
  /** false quando empreendimento não bateu no catálogo (importa como rascunho) */
  empreendimentoResolvido: boolean;
  avisos?: string[];
}

export type FormatoImportacao = 'xlsx' | 'csv' | 'docx' | 'pdf' | 'md' | 'desconhecido';

export interface LinhaImportResultado {
  linha: number;
  status: 'ok' | 'erro' | 'ignorado';
  acao?: 'insert' | 'update' | 'preview' | 'skip';
  acomodacaoId?: number;
  erros?: string[];
  avisos?: string[];
  titulo?: string;
  codigoExterno?: string | null;
}

export interface RelatorioImportacao {
  dryRun: boolean;
  total: number;
  sucesso: number;
  erros: number;
  ignorados?: number;
  linhas: LinhaImportResultado[];
}

export interface ProcessarImportOptions {
  dryRun?: boolean;
  proprietarioId?: number | null;
  criarTipoSeAusente?: boolean;
  /** Staff bulk inventário — default `rascunho` */
  statusPublicacao?: 'rascunho' | 'completo' | 'em_aprovacao' | 'publicado' | 'rejeitado';
  /** Atalho PR 23: força `publicado` + `dados_completos` derivado */
  bulkPublicado?: boolean;
  /** PR 24C: limite de linhas para parceiro (default 50) */
  maxLinhasParceiro?: number;
}

module.exports = {
  acomodacaoImportSchema,
  configSalaImportSchema,
  configBanheiroImportSchema,
};
