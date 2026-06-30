import { z } from 'zod';

/** §19.9 — contrato canônico de importação de acomodações. */
export const configSalaImportSchema = z.enum(['nenhum', 'cama_na_sala', 'sofa_cama']);
export const configBanheiroImportSchema = z.enum([
  'suite_wc_social',
  'so_suite',
  'so_wc_social',
]);

export const acomodacaoImportSchema = z.object({
  codigoExterno: z.string().max(128).optional().nullable(),
  empreendimento: z.string().min(1, 'empreendimento obrigatório'),
  tipo: z.string().min(1, 'tipo obrigatório'),
  titulo: z.string().min(1).max(255),
  quartos: z.coerce.number().int().min(1).default(1),
  capacidadeMax: z.coerce.number().int().min(1, 'capacidade_max obrigatória'),
  capacidadeBase: z.coerce.number().int().min(1).optional().nullable(),
  configSala: configSalaImportSchema.default('nenhum'),
  configBanheiro: configBanheiroImportSchema.default('so_wc_social'),
  precoDiaria: z.coerce.number().min(0).optional().nullable(),
  utensilios: z.array(z.string()).optional().default([]),
  eletrodomesticos: z.array(z.string()).optional().default([]),
  amenidades: z.array(z.string()).optional().default([]),
  midia: z.array(z.string()).optional().default([]),
});

export type AcomodacaoImportDTO = z.infer<typeof acomodacaoImportSchema>;

export interface AcomodacaoImportResolved extends AcomodacaoImportDTO {
  hotelId: string;
  tipoId: number;
}

export type FormatoImportacao = 'xlsx' | 'csv' | 'docx' | 'pdf' | 'md' | 'desconhecido';

export interface LinhaImportResultado {
  linha: number;
  status: 'ok' | 'erro' | 'ignorado';
  acao?: 'insert' | 'update' | 'preview';
  acomodacaoId?: number;
  erros?: string[];
  titulo?: string;
  codigoExterno?: string | null;
}

export interface RelatorioImportacao {
  dryRun: boolean;
  total: number;
  sucesso: number;
  erros: number;
  linhas: LinhaImportResultado[];
}

export interface ProcessarImportOptions {
  dryRun?: boolean;
  anfitriaoId?: string | null;
  criarTipoSeAusente?: boolean;
}

module.exports = {
  acomodacaoImportSchema,
  configSalaImportSchema,
  configBanheiroImportSchema,
};
